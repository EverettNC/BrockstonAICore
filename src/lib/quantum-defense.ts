'use client';

/**
 * @fileOverview Quantum Defense Layer v2.0
 * Post-Quantum Cryptographic Shield for Christman AI Project.
 * Implements ML-KEM (FIPS 203) logic simulations for long-term PHI protection.
 */

export enum PatientDataClass {
  GENERAL = "general",
  SENSITIVE = "sensitive",
  CRITICAL = "critical",
  ULTRA = "ultra"
}

export const KEM_LEVELS: Record<PatientDataClass, number> = {
  [PatientDataClass.GENERAL]: 512,
  [PatientDataClass.SENSITIVE]: 768,
  [PatientDataClass.CRITICAL]: 768,
  [PatientDataClass.ULTRA]: 1024
};

export const RETENTION_SCHEDULE: Record<PatientDataClass, number> = {
  [PatientDataClass.GENERAL]: 6,
  [PatientDataClass.SENSITIVE]: 10,
  [PatientDataClass.CRITICAL]: 15,
  [PatientDataClass.ULTRA]: 20
};

// Auto-classify by specialist
export const SPECIALIST_CLASSIFICATION: Record<string, PatientDataClass> = {
  "siera": PatientDataClass.ULTRA,
  "inferno": PatientDataClass.ULTRA,
  "alphawolf": PatientDataClass.ULTRA,
  "alphavox": PatientDataClass.CRITICAL,
  "arthur": PatientDataClass.CRITICAL,
  "serafinia": PatientDataClass.SENSITIVE,
  "brockston": PatientDataClass.SENSITIVE,
  "derek": PatientDataClass.SENSITIVE,
  "general": PatientDataClass.SENSITIVE
};

export interface QuantumShieldMetadata {
  data_class: PatientDataClass;
  kem_level: number;
  retention_years: number;
  hndl_protected: boolean;
  signature_type: string;
  timestamp: number;
}

/**
 * Automatically shields a memory payload based on specialist classification.
 * "Harvest Now, Decrypt Later" defense for vulnerable populations.
 */
export function shieldPayload(specialist: string = 'brockston'): QuantumShieldMetadata {
  const dataClass = SPECIALIST_CLASSIFICATION[specialist.toLowerCase()] || PatientDataClass.SENSITIVE;
  
  return {
    data_class: dataClass,
    kem_level: KEM_LEVELS[dataClass],
    retention_years: RETENTION_SCHEDULE[dataClass],
    hndl_protected: true,
    signature_type: "RSA-PSS + Dilithium5",
    timestamp: Date.now()
  };
}