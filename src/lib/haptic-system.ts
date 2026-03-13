/**
 * @fileOverview Physiological Haptic System for BROCKSTON.
 * Bridges ToneEngine v2.0 emotions to tactile feedback (Web Serial + Vibration API).
 * Ported from TextileHaptics and phone_haptic Python modules.
 */

export type HapticPattern = 'warm' | 'rough' | 'soft' | 'none';

class HapticSystem {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;

  /**
   * Connect to the Arduino-enabled textile via Web Serial.
   */
  async connectSerial() {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      console.log("✅ Haptic Textile connected via Web Serial");
      return true;
    } catch (err) {
      console.error("❌ Haptic Serial connection failed:", err);
      return false;
    }
  }

  /**
   * Trigger both textile and mobile haptics based on emotion.
   */
  async trigger(pattern: HapticPattern) {
    if (pattern === 'none') return;

    // 1. Arduino Textile Haptics (Serial)
    if (this.writer) {
      const encoder = new TextEncoder();
      const command = pattern.toUpperCase() + "\n";
      this.writer.write(encoder.encode(command));
    }

    // 2. Browser/Phone Haptics (Vibration API)
    // Mirrors the 'adb shell' phone_haptic logic
    if ("vibrate" in navigator) {
      if (pattern === 'warm') {
        // Slow pulse / Long buzz
        navigator.vibrate(500);
      } else if (pattern === 'rough') {
        // Fast jitter / Quick stutters
        navigator.vibrate([100, 50, 100, 50, 100]);
      } else if (pattern === 'soft') {
        // Gentle wave
        navigator.vibrate([200, 200, 200]);
      }
    }
  }

  /**
   * Close connections
   */
  async disconnect() {
    if (this.writer) {
      await this.writer.close();
      this.writer = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }
}

export const hapticSystem = new HapticSystem();
