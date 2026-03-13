"use client";

import React, { useState } from 'react';
import { ChristmanCipher, KDFMode } from '@/lib/christman-cipher';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, ShieldCheck, Key, Eye, EyeOff, Terminal, Zap, ShieldAlert, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const CipherLab: React.FC = () => {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('GEORGE');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVigenere = (decrypt = false) => {
    try {
      const res = ChristmanCipher.vigenereProcess(input, key, decrypt);
      setOutput(res);
      toast({ title: decrypt ? "Decryption Complete" : "Encryption Complete", description: "Tier 1 George-loop processed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleAES = async (decrypt = false) => {
    if (!password) {
      toast({ variant: "destructive", title: "Missing Password", description: "Tier 2 requires a strong password for KDF." });
      return;
    }
    setLoading(true);
    try {
      if (decrypt) {
        const payload = JSON.parse(input);
        const res = await ChristmanCipher.aesDecrypt(payload, password);
        setOutput(res);
      } else {
        const res = await ChristmanCipher.aesEncrypt(input, password);
        setOutput(JSON.stringify(res, null, 2));
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Crypto Failure", description: "Authentication failed or corrupted data." });
    } finally {
      setLoading(false);
    }
  };

  const handleLSB = () => {
    try {
      // Simulated carrier for LSB
      const carrier = new Uint8Array(1024).fill(128); 
      const embedded = ChristmanCipher.embedLSB(carrier, input);
      const extracted = ChristmanCipher.extractLSB(embedded);
      setOutput(`[LSB EMBEDDED IN 1024 BYTES]\nExtracted Check: ${extracted}`);
      toast({ title: "Stego Success", description: "Hidden in LSB bits." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Stego Error", description: e.message });
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto system-log pr-2">
      <header className="flex-none bg-accent/5 p-4 rounded-xl border border-accent/20 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        <h2 className="text-xl font-headline tracking-tighter uppercase text-accent flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Christman Cipher Suite v3.0
        </h2>
        <p className="text-[10px] font-code text-secondary/60 uppercase tracking-widest mt-1 italic">
          "Nothing Vital Lives Below Root" | Tier Architecture Active
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20 shadow-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span>Cryptographic Input</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">PBKDF2-SHA512 Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-code text-secondary/60">Plaintext / Payload</label>
                <Textarea 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter message or JSON payload..."
                  className="bg-primary/10 border-white/10 font-code text-xs min-h-[150px] focus-visible:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-code text-secondary/60">Vigenère Key</label>
                  <Input 
                    value={key} 
                    onChange={(e) => setKey(e.target.value)}
                    className="bg-primary/10 border-white/10 text-xs h-8 font-code uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-code text-secondary/60">Tier 2 Password</label>
                  <Input 
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-primary/10 border-white/10 text-xs h-8 font-code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-accent font-code">
                <Zap className="h-3 w-3" /> SECURITY DIRECTIVE
              </div>
              <p className="text-[10px] text-secondary leading-relaxed italic">
                "Encryption isn't just about hiding data; it's about claiming sovereignty over your own truth. Tier 7 Steganography allows us to hide survival protocols in plain sight."
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          <Tabs defaultValue="tier1" className="flex-1 flex flex-col">
            <TabsList className="bg-black/40 border-white/5 w-full grid grid-cols-4 h-10">
              <TabsTrigger value="tier1" className="text-[10px] uppercase font-code data-[state=active]:bg-accent/10 data-[state=active]:text-accent">Tier 1</TabsTrigger>
              <TabsTrigger value="tier2" className="text-[10px] uppercase font-code data-[state=active]:bg-accent/10 data-[state=active]:text-accent">Tier 2/3</TabsTrigger>
              <TabsTrigger value="tier4" className="text-[10px] uppercase font-code data-[state=active]:bg-accent/10 data-[state=active]:text-accent">Tier 4/5</TabsTrigger>
              <TabsTrigger value="tier7" className="text-[10px] uppercase font-code data-[state=active]:bg-accent/10 data-[state=active]:text-accent">Tier 7</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 mt-4">
              <TabsContent value="tier1" className="h-full m-0 space-y-4">
                <Card className="bg-black/20 border-white/5 h-full flex flex-col">
                  <CardHeader className="py-3 border-b border-white/5 bg-accent/5">
                    <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                      <Binary className="h-3 w-3 text-accent" /> Legacy George-Loop Cipher
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={() => handleVigenere()} className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 uppercase font-headline h-12">
                        <Lock className="h-4 w-4 mr-2" /> Tier 1 Encrypt
                      </Button>
                      <Button onClick={() => handleVigenere(true)} variant="outline" className="border-accent/20 text-accent hover:bg-accent/10 uppercase font-headline h-12">
                        <Unlock className="h-4 w-4 mr-2" /> Tier 1 Decrypt
                      </Button>
                    </div>
                    <OutputArea value={output} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tier2" className="h-full m-0">
                <Card className="bg-black/20 border-white/5 h-full flex flex-col">
                  <CardHeader className="py-3 border-b border-white/5 bg-accent/5">
                    <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="h-3 w-3 text-accent" /> Authenticated Symmetric AEAD
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <Button disabled={loading} onClick={() => handleAES()} className="bg-accent text-accent-foreground glow-accent hover:bg-accent/80 uppercase font-headline h-12">
                        {loading ? <Zap className="animate-spin h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                        AES-256-GCM Secure
                      </Button>
                      <Button disabled={loading} onClick={() => handleAES(true)} variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 uppercase font-headline h-12">
                        <Unlock className="h-4 w-4 mr-2" /> AES-256-GCM Open
                      </Button>
                    </div>
                    <OutputArea value={output} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tier7" className="h-full m-0">
                <Card className="bg-black/20 border-white/5 h-full flex flex-col">
                  <CardHeader className="py-3 border-b border-white/5 bg-accent/5">
                    <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                      <Eye className="h-3 w-3 text-accent" /> LSB Steganography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                    <div className="p-4 bg-primary/10 rounded-lg border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-[9px] text-accent/60 font-code uppercase">
                        <ShieldAlert className="h-3 w-3" /> Invisible Channel Active
                      </div>
                      <p className="text-[11px] text-secondary/80 leading-relaxed">
                        LSB Steganography hides your text inside the least significant bits of raw byte carriers. In this lab, we use a 1024-byte dummy carrier to demonstrate the embedding process.
                      </p>
                      <Button onClick={handleLSB} className="w-full bg-accent/10 border-accent/30 text-accent hover:bg-accent/20 h-10 font-headline uppercase">
                        Embed into Noise
                      </Button>
                    </div>
                    <OutputArea value={output} />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

function OutputArea({ value }: { value: string }) {
  return (
    <div className="flex-1 min-h-0 bg-black/40 rounded-xl border border-white/10 p-4 font-code text-[11px] relative group">
      <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-60 transition-opacity">
        <Terminal className="h-3 w-3" />
      </div>
      <div className="h-full overflow-y-auto system-log text-accent/80 whitespace-pre-wrap selection:bg-accent/20 selection:text-accent">
        {value || "[AWAITING CRYPTOGRAPHIC RESULT...]"}
      </div>
    </div>
  );
}
