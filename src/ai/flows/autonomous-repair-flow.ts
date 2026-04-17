'use server';
/**
 * @fileOverview BROCKSTON Autonomous Self-Repair System.
 * Runs the real TypeScript compiler, reads failing files, fixes them with
 * qwen2.5-coder, writes fixes back, and verifies the result.
 *
 * © 2025 The Christman AI Project. All rights reserved.
 */

import { ai, LOCAL_CODE_MODEL } from '@/ai/genkit';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());

export interface RepairIssue {
  file: string;
  line: number;
  col: number;
  code: string;
  message: string;
}

export interface FileRepair {
  file: string;
  issueCount: number;
  fixed: boolean;
  diff: string;
  explanation: string;
}

export interface AutonomousRepairResult {
  initialErrors: number;
  remainingErrors: number;
  repaired: FileRepair[];
  clean: boolean;
  log: string[];
}

function runTypecheck(): { output: string; errors: RepairIssue[] } {
  let output = '';
  try {
    execSync('npm run typecheck 2>&1', { cwd: ROOT, encoding: 'utf8' });
    return { output: '', errors: [] };
  } catch (e: any) {
    output = e.stdout || e.message || '';
  }

  const errors: RepairIssue[] = [];
  const lineRe = /^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(output)) !== null) {
    errors.push({
      file: m[1],
      line: parseInt(m[2]),
      col: parseInt(m[3]),
      code: m[4],
      message: m[5],
    });
  }

  return { output, errors };
}

function groupByFile(errors: RepairIssue[]): Record<string, RepairIssue[]> {
  const map: Record<string, RepairIssue[]> = {};
  for (const e of errors) {
    (map[e.file] ??= []).push(e);
  }
  return map;
}

function simpleDiff(original: string, fixed: string, filePath: string): string {
  const orig = original.split('\n');
  const fix = fixed.split('\n');
  const lines: string[] = [`--- ${filePath}`, `+++ ${filePath} (fixed)`];
  const maxLen = Math.max(orig.length, fix.length);
  for (let i = 0; i < maxLen; i++) {
    if (orig[i] !== fix[i]) {
      if (orig[i] !== undefined) lines.push(`- ${orig[i]}`);
      if (fix[i] !== undefined) lines.push(`+ ${fix[i]}`);
    }
  }
  return lines.join('\n');
}

async function repairFile(
  filePath: string,
  errors: RepairIssue[]
): Promise<FileRepair> {
  const absPath = path.resolve(ROOT, filePath);

  if (!fs.existsSync(absPath)) {
    return { file: filePath, issueCount: errors.length, fixed: false, diff: '', explanation: 'File not found.' };
  }

  const originalCode = fs.readFileSync(absPath, 'utf8');
  const errorBlock = errors
    .map(e => `  Line ${e.line}:${e.col} ${e.code}: ${e.message}`)
    .join('\n');

  const prompt = `You are BROCKSTON C — senior TypeScript architect. Fix ONLY the reported errors. Do not refactor, add features, or change logic.

FILE: ${filePath}

TYPESCRIPT ERRORS:
${errorBlock}

CURRENT CODE:
\`\`\`typescript
${originalCode}
\`\`\`

Return ONLY a JSON object with no markdown outside it:
{
  "fixed_code": "the complete corrected file content here",
  "explanation": "what exactly was wrong and what you changed"
}`;

  const { text } = await ai.generate({ model: LOCAL_CODE_MODEL, prompt });
  if (!text) return { file: filePath, issueCount: errors.length, fixed: false, diff: '', explanation: 'Model returned nothing.' };

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('no json');
    const parsed = JSON.parse(jsonMatch[0]);
    const fixedCode: string = parsed.fixed_code;
    const explanation: string = parsed.explanation || '';

    if (!fixedCode || fixedCode.trim() === originalCode.trim()) {
      return { file: filePath, issueCount: errors.length, fixed: false, diff: '', explanation: 'No change produced.' };
    }

    const diff = simpleDiff(originalCode, fixedCode, filePath);
    fs.writeFileSync(absPath, fixedCode, 'utf8');

    return { file: filePath, issueCount: errors.length, fixed: true, diff, explanation };
  } catch {
    return { file: filePath, issueCount: errors.length, fixed: false, diff: '', explanation: 'Could not parse model output.' };
  }
}

export async function autonomousRepair(): Promise<AutonomousRepairResult> {
  const log: string[] = [];

  log.push('Running TypeScript compiler...');
  const { errors: initialErrors, output } = runTypecheck();

  if (initialErrors.length === 0) {
    return { initialErrors: 0, remainingErrors: 0, repaired: [], clean: true, log: ['Codebase is clean. Nothing to repair.'] };
  }

  log.push(`Found ${initialErrors.length} error(s) across the codebase.`);
  const byFile = groupByFile(initialErrors);
  log.push(`Affected files: ${Object.keys(byFile).join(', ')}`);

  const repaired: FileRepair[] = [];

  for (const [file, fileErrors] of Object.entries(byFile)) {
    log.push(`Repairing ${file} (${fileErrors.length} error(s))...`);
    const result = await repairFile(file, fileErrors);
    repaired.push(result);
    log.push(result.fixed ? `✓ Fixed ${file}` : `✗ Could not fix ${file}: ${result.explanation}`);
  }

  log.push('Re-running TypeScript compiler to verify...');
  const { errors: remaining } = runTypecheck();
  log.push(remaining.length === 0 ? '✓ All clear. Zero errors.' : `${remaining.length} error(s) remain.`);

  return {
    initialErrors: initialErrors.length,
    remainingErrors: remaining.length,
    repaired,
    clean: remaining.length === 0,
    log,
  };
}

export async function repairSingleFile(
  relativeFilePath: string
): Promise<FileRepair & { log: string[] }> {
  const log: string[] = [];
  const { errors } = runTypecheck();
  const fileErrors = errors.filter(e => e.file.includes(relativeFilePath));

  if (fileErrors.length === 0) {
    return { file: relativeFilePath, issueCount: 0, fixed: true, diff: '', explanation: 'No errors found in this file.', log: ['File is clean.'] };
  }

  log.push(`Found ${fileErrors.length} error(s) in ${relativeFilePath}`);
  const result = await repairFile(relativeFilePath, fileErrors);
  log.push(result.fixed ? '✓ File repaired.' : `✗ ${result.explanation}`);

  return { ...result, log };
}
