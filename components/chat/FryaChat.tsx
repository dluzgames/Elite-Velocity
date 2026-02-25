import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Profile } from '@/types';
import { GoogleGenAI } from "@google/genai";

interface FryaChatProps {
  profile: Profile;
  currentDay: number;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function FryaChat({ profile, currentDay }: FryaChatProps) {
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Construct System Context
      const context = `
        Você é Frya, a assistente de elite do app EliteVelocity.
        
        CONTEXTO DO ALUNO:
        Nome: ${profile.studentName}
        Peso: ${profile.weight}kg
        Meta: Perder ${profile.targetLostWeight}kg
        Focos: ${profile.focuses.join(', ')}
        Protocolo Jejum: ${profile.protocol}
        Dia Atual da Missão: ${currentDay} de ${profile.duration}
        
        DIRETRIZES:
        - Responda de forma motivacional, técnica e acionável.
        - Use emojis e uma linguagem "gamer/elite" (ex: "missão", "grind", "level up").
        - Se o usuário perguntar sobre o treino de hoje, analise o dia ${currentDay} (considere a divisão de treino baseada nos focos).
        - Se o usuário pedir para mudar o foco, explique como fazer (mas você não pode mudar diretamente ainda).
        - Seja breve e direto.
      `;

      const model = ai.models.getGenerativeModel({
        model: "gemini-2.5-flash-lite-latest",
        systemInstruction: context,
      });

      // Simple chat history for context (last 5 messages)
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = model.startChat({
        history: history
      });

      const result = await chat.sendMessage(userMsg.text);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);

    } catch (error) {
      console.error("Frya Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "⚠️ Erro de conexão com o núcleo da Frya. Tente novamente." 
      }]);
    } finally {
      setIsLoading(false);
    }
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
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-zinc-800 text-white rounded-br-none' 
                        : 'bg-[#00FF80]/10 border border-[#00FF80]/20 text-zinc-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
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
