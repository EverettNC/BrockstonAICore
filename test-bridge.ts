import { brainCore } from './src/lib/python-bridge';

async function test() {
  console.log('Testing Brain Core...');
  try {
    // Just a small wait for initialization
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Testing Resonance Quantification...');
    const res = await brainCore.execute('quantify_resonance', { agony: 150, purpose: 150 });
    console.log('Resonance Result:', res);
    
    process.exit(0);
  } catch (e) {
    console.error('Test Failed:', e);
    process.exit(1);
  }
}

test();
