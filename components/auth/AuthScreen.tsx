import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => { success: boolean; error?: string };
  onSignup: (name: string, email: string, password: string) => { success: boolean; error?: string };
}

export default function AuthScreen({ onLogin, onSignup }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const result = isLogin 
      ? onLogin(email, password)
      : onSignup(name, email, password);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00FF80]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 shadow-[0_0_30px_rgba(0,255,128,0.1)]">
            <Activity size={32} className="text-[#00FF80]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">DLUZ ELITE FIT</h1>
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Sistema de Alta Performance</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-zinc-800/50 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                {isLogin ? 'Acessar Sistema' : 'Criar Conta'}
              </h2>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00FF80] focus:ring-1 focus:ring-[#00FF80] transition-all"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00FF80] focus:ring-1 focus:ring-[#00FF80] transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-zinc-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00FF80] focus:ring-1 focus:ring-[#00FF80] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-6 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-[#00FF80] text-black hover:bg-[#00CC66] transition-colors shadow-[0_0_20px_rgba(0,255,128,0.2)]"
              >
                {isLogin ? 'Entrar' : 'Cadastrar'}
                <ArrowRight size={18} />
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
