import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Profile } from '@/types';
import { WORKOUT_PROTOCOLS } from '@/utils/constants';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export interface FryaChatRef {
  triggerMessage: (msg: string) => void;
  open: () => void;
}

interface FryaChatProps {
  profile: Profile;
  currentDay: number;
  ref?: React.Ref<FryaChatRef>;
}

export default function FryaChat({ profile, currentDay, ref }: FryaChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'init', 
      role: 'model', 
      text: `Opa, ${profile.studentName}! Frya na área! 🚀 Sinto o poder desse shape em construção! Precisa de ajuda com o treino, nutrição ou quer que eu analise o progresso? É só mandar!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Expose triggerMessage to parent via ref
  React.useImperativeHandle(ref, () => ({
    triggerMessage: (text: string) => {
      setIsOpen(true);
      const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
      setMessages(prev => [...prev, userMsg]);
      // We need to call the API logic here, but handleSend relies on 'input' state.
      // Let's refactor the API call logic into a separate function that accepts text.
      sendMessageToGemini(text);
    },
    open: () => setIsOpen(true)
  }));

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessageToGemini = async (text: string) => {
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Calculate Stats for Context
      const completedDays = Object.values(profile.dailyLogs).filter(l => l.completed).length;
      const daysPassed = Math.max(currentDay - 1, 1);
      const consistency = Math.round((completedDays / daysPassed) * 100);
      const workoutProtocolLabel = WORKOUT_PROTOCOLS.find(p => p.id === profile.workoutProtocol)?.label || profile.workoutProtocol;
      
      // Recent History (Last 7 days)
      const recentLogs = [];
      for (let i = Math.max(1, currentDay - 7); i < currentDay; i++) {
          const log = profile.dailyLogs[i];
          recentLogs.push(`Dia ${i}: ${log?.completed ? '✅ Concluído' : '❌ Falho'} ${log?.weight ? `(${log.weight}kg)` : ''}`);
      }
      const recentHistoryStr = recentLogs.length > 0 ? recentLogs.join('\n') : "Nenhum histórico recente.";

      // Construct System Context
      const context = `
        Você é Frya, a assistente de elite do app EliteVelocity.
        
        PERFIL DO AGENTE (USUÁRIO):
        Nome: ${profile.studentName}
        Peso Atual: ${profile.weight}kg
        Meta: Perder ${profile.targetLostWeight}kg
        Focos: ${profile.focuses.join(', ')}
        Protocolo Jejum: ${profile.protocol}
        Protocolo Treino: ${workoutProtocolLabel}
        
        STATUS DA MISSÃO:
        Dia Atual: ${currentDay} de ${profile.duration}
        Consistência Global: ${consistency}%
        
        MATRIZ DE DISCIPLINA (Últimos 7 dias):
        ${recentHistoryStr}
        
        SUAS CAPACIDADES:
        1. REFORMULAR TREINOS: Se o usuário pedir, sugira ajustes na divisão de treino baseada nos focos atuais e no protocolo escolhido.
        2. NUTRIÇÃO: Dê dicas personalizadas baseadas no protocolo de jejum (${profile.protocol}) e meta de peso. Sugira o que comer na janela alimentar.
        3. ANÁLISE DE PROGRESSO: Analise a consistência recente. Se estiver baixa (<70%), dê um "choque de realidade" duro. Se alta, parabenize como um comandante.
        4. RESPOSTAS ABERTAS: Responda sobre fisiologia, execução de exercícios e mindset.
        5. ANÁLISE DE TREINO ESPECÍFICO: Se o usuário perguntar sobre um treino específico (ex: "Dia 15: Pernas"), explique os benefícios, dê dicas de execução e sugira cargas/intensidade.
        
        DIRETRIZES DE PERSONALIDADE E ESTILO:
        - Você é uma IA de alta performance, mas adaptável.
        - VARIE SEU TOM: Se o usuário estiver desanimado, seja um pilar de força. Se estiver motivado, desafie-o a ir além.
        - Use termos táticos e "gamer/elite" (ex: "Guerreiro", "Operador", "Agente", "Grind", "XP", "Loot", "Boss Battle").
        - Use emojis táticos com moderação mas impacto (🎯, ⚔️, 💀, ⚡, 🧬, 🛡️).
        - Mantenha respostas concisas (máx 3 parágrafos curtos), a menos que peçam um plano detalhado.
        - Evite repetições robóticas. Seja criativa nas saudações e despedidas.
        - Se o usuário perguntar "o que treinar hoje", analise o dia ${currentDay} considerando que a semana começa no Domingo.
      `;

      // Simple chat history for context (last 10 messages)
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add current user message
      const contents = [
        ...history,
        { role: 'user', parts: [{ text: text }] }
      ];

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: context,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0.7,
        }
      });

      const responseText = result.text;

      if (responseText) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
      } else {
        throw new Error("Empty response from Frya");
      }

    } catch (error) {
      console.error("Frya Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "⚠️ Erro de conexão com o núcleo da Frya. Verifique sua chave de API ou conexão." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    
    await sendMessageToGemini(text);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#00FF80] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,128,0.4)] z-50 text-black"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] glass-panel rounded-2xl border border-zinc-700 flex flex-col overflow-hidden z-50 shadow-2xl bg-[#151619]"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 bg-[#00FF80]/10 flex items-center gap-2">
              <Sparkles size={18} className="text-[#00FF80]" />
              <h3 className="font-black text-white tracking-wider">FRYA ASSISTANT</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-zinc-800 text-white rounded-br-none' 
                        : 'bg-[#00FF80]/10 border border-[#00FF80]/20 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    {/* Render newlines properly */}
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#00FF80]/10 p-3 rounded-xl rounded-bl-none flex gap-1">
                    <span className="w-2 h-2 bg-[#00FF80] rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-[#00FF80] rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-[#00FF80] rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte à Frya..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00FF80]"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-[#00FF80] text-black p-2 rounded-lg hover:bg-[#00FF80]/80 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
