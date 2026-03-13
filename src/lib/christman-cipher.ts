/**
 * © 2025 The Christman AI Project. All rights reserved.
 * 
 * CHRISTMAN CIPHER SUITE v3.0 | TypeScript Implementation
 * "Not in my world. Not ever again." — Everett Christman
 */

export enum KDFMode {
  PBKDF2 = "PBKDF2-HMAC-SHA512",
  DUAL = "Dual-KDF"
}

export class ChristmanCipher {
  private static ITERATIONS = 600000;
  private static SALT_LEN = 32;

  // --- TIER 1: VIGENÈRE (GEORGE-LOOP) ---
  
  static vigenereProcess(text: string, key: string, decrypt: boolean = false): string {
    const alphaOnlyKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!alphaOnlyKey) return text;

    let expandedKey = alphaOnlyKey;
    while (expandedKey.length < text.length) {
      // Key expansion via SHA-256 to fill length (simulated logic)
      expandedKey += expandedKey; 
    }

    const keystream = expandedKey.split('').map(c => c.charCodeAt(0) - 65);
    let ki = 0;
    
    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        let shift = keystream[ki % keystream.length];
        if (decrypt) shift = -shift;
        ki++;
        return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
      }
      return char;
    }).join('');
  }

  // --- KDF ENGINE ---

  static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: this.ITERATIONS,
        hash: "SHA-512"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // --- TIER 2: AES-256-GCM ---

  static async aesEncrypt(plaintext: string, password: string): Promise<any> {
    const salt = window.crypto.getRandomValues(new Uint8Array(this.SALT_LEN));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    
    const enc = new TextEncoder();
    const ct = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(plaintext)
    );

    return {
      algorithm: "AES-256-GCM",
      salt: btoa(String.fromCharCode(...salt)),
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ct)))
    };
  }

  static async aesDecrypt(payload: any, password: string): Promise<string> {
    const salt = new Uint8Array(atob(payload.salt).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(payload.iv).split('').map(c => c.charCodeAt(0)));
    const ct = new Uint8Array(atob(payload.ciphertext).split('').map(c => c.charCodeAt(0)));
    const key = await this.deriveKey(password, salt);

    const pt = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ct
    );

    return new TextDecoder().decode(pt);
  }

  // --- TIER 4: RSA-4096 ---

  static async generateRSAKeypair() {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-512",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // --- TIER 7: STEGANOGRAPHY ---

  static embedLSB(carrier: Uint8Array, secret: string): Uint8Array {
    const enc = new TextEncoder();
    const delimiter = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1]);
    const payload = new Uint8Array([...enc.encode(secret), ...delimiter]);
    
    let bits = "";
    payload.forEach(byte => {
      bits += byte.toString(2).padStart(8, '0');
    });

    if (bits.length > carrier.length) throw new Error("Carrier too small");

    const result = new Uint8Array(carrier);
    for (let i = 0; i < bits.length; i++) {
      result[i] = (result[i] & 0xFE) | parseInt(bits[i]);
    }
    return result;
  }

  static extractLSB(carrier: Uint8Array): string {
    let bits = "";
    for (let i = 0; i < carrier.length; i++) {
      bits += (carrier[i] & 1).toString();
    }

    const bytes = [];
    const delimiter = [0, 0, 0, 0, 0, 0, 0, 1];
    
    for (let i = 0; i < bits.length; i += 8) {
      const byte = parseInt(bits.substr(i, 8), 2);
      bytes.push(byte);
      
      if (bytes.length >= 8) {
        const last8 = bytes.slice(-8);
        if (last8.every((v, idx) => v === delimiter[idx])) {
          return new TextDecoder().decode(new Uint8Array(bytes.slice(0, -8)));
        }
      }
    }
    throw new Error("No hidden message found");
  }
}
