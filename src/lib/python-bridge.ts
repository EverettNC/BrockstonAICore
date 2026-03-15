import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export class PythonBridge {
  private static instance: PythonBridge;
  private process: ChildProcess | null = null;
  private ready: boolean = false;

  private constructor() {
    this.init();
  }

  static getInstance(): PythonBridge {
    if (!PythonBridge.instance) {
      PythonBridge.instance = new PythonBridge();
    }
    return PythonBridge.instance;
  }

  private init() {
    const bridgePath = path.join(process.cwd(), 'src/ai/python_core/bridge.py');
    console.log(`[CORE] Spawning Python Brain Core: ${bridgePath}`);

    this.process = spawn('python3', [bridgePath]);

    this.process.stdout?.on('data', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.status === 'READY') {
          this.ready = true;
          console.log('[CORE] Python Brain Core READY');
        }
      } catch (e) {
        console.error('[CORE] Error parsing bridge output:', data.toString());
      }
    });

    this.process.stderr?.on('data', (data) => {
      console.error('[CORE] Python Bridge Error:', data.toString());
    });
  }

  async execute(action: string, payload: any): Promise<any> {
    if (!this.process || !this.ready) {
      throw new Error('Python Bridge not ready');
    }

    return new Promise((resolve, reject) => {
      const command = JSON.stringify({ action, ...payload }) + '\n';
      
      const onData = (data: Buffer) => {
        try {
          const res = JSON.parse(data.toString());
          if (res.action === action) {
            this.process?.stdout?.removeListener('data', onData);
            if (res.status === 'SUCCESS') resolve(res.data);
            else reject(new Error(res.message));
          }
        } catch (e) {
          // Might be partial data or unrelated log
        }
      };

      this.process?.stdout?.on('data', onData);
      this.process?.stdin?.write(command);
    });
  }
}

export const brainCore = PythonBridge.getInstance();
