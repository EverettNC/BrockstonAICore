declare module 'wav' {
  import { Transform } from 'stream';

  interface WriterOptions {
    sampleRate?: number;
    channels?: number;
    bitDepth?: number;
  }

  class Writer extends Transform {
    constructor(options?: WriterOptions);
  }

  const wav: { Writer: typeof Writer };
  export = wav;
}
