import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '../../lib/chatStore';
import { useAuth } from '../../providers/AuthProvider';

export function ChatWidget() {
  const { isOpen, toggleOpen, messages, isLoading, sendMessage } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim();
    setInput('');
    
    const action = await sendMessage(messageToSend, accessToken);
    
    if (action?.type === 'NAVIGATE' && action.payload) {
      setTimeout(() => navigate(action.payload), 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] h-[500px] bg-[#0f0f15] border border-white/10 rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-[#1a1a24] border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">CuanLimbah AI</h3>
                <p className="text-xs text-gray-400">Asisten Cerdas Anda</p>
              </div>
            </div>
            <button onClick={toggleOpen} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0f]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">
                Ketikkan sesuatu untuk mulai bertanya tentang harga limbah, lokasi drop point, atau bantuan lainnya.
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-green-500 text-white rounded-br-none' : 'bg-white/5 text-gray-200 rounded-bl-none border border-white/5'}`}>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="space-y-2 leading-relaxed">
                      <ReactMarkdown
                        components={{
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
                          a: ({ node, ...props }) => <a className="text-green-400 hover:underline" {...props} />,
                          p: ({ node, ...props }) => <p className="m-0" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  Berpikir...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-[#1a1a24] border-t border-white/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya sesuatu..."
                disabled={isLoading}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95 ${isOpen ? 'bg-[#1a1a24] text-white border border-white/10' : 'bg-green-500 text-white hover:bg-green-600'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
