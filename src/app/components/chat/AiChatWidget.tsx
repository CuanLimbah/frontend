import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bot, Loader2, MessageCircle, SendHorizontal, Sparkles, X } from 'lucide-react';
import { api, getErrorMessage, type ChatAction } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import './AiChatWidget.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: ChatAction | null;
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: 'Halo, saya asisten CuanLimbah. Saya bisa bantu jelaskan fitur, alur setor limbah, atau arahkan kamu ke halaman yang tepat.',
};

const suggestedPrompts = [
  'Estimasi cuan 10 liter minyak jelantah grade B',
  'Kenapa harga setoran saya berubah?',
  'Apa bedanya grade A, B, dan C?',
];

function createMessage(sender: ChatMessage['sender'], text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    text,
  };
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || isSending) {
      return;
    }

    setInput('');
    setIsSending(true);

    const pendingMessage = createMessage('assistant', 'Sedang memproses...');
    setMessages((current) => [
      ...current,
      createMessage('user', message),
      pendingMessage,
    ]);

    try {
      const response = await api.chat(accessToken, {
        message,
        userId: user?.id,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === pendingMessage.id
            ? {
                ...item,
                text: response.reply || 'Saya belum mendapatkan jawaban.',
                action: response.action,
              }
            : item,
        ),
      );

      if (response.action?.type === 'NAVIGATE' && response.action.payload) {
        window.setTimeout(() => {
          navigate(response.action?.payload || '/');
        }, 500);
      }
    } catch (error) {
      setMessages((current) =>
        current.map((item) =>
          item.id === pendingMessage.id
            ? {
                ...item,
                text: getErrorMessage(
                  error,
                  'Asisten belum bisa dihubungi. Pastikan backend dan konfigurasi LLM aktif.',
                ),
              }
            : item,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="ai-chat-widget">
      {isOpen && (
        <section className="ai-chat-panel" aria-label="Asisten AI CuanLimbah">
          <header className="ai-chat-header">
            <div className="ai-chat-avatar">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="ai-chat-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                AI Assistant
              </p>
              <h2>Asisten CuanLimbah</h2>
            </div>
          </header>

          <div className="ai-chat-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`ai-chat-message ai-chat-message-${message.sender}`}
              >
                <p>{message.text}</p>
                {message.action?.type === 'NAVIGATE' && (
                  <span className="ai-chat-action">
                    Membuka {message.action.payload}
                  </span>
                )}
              </article>
            ))}
            {isSending && (
              <div className="ai-chat-thinking">
                <Loader2 className="h-4 w-4 animate-spin" />
                Menunggu respons model
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-suggestions" aria-label="Contoh pertanyaan">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                disabled={isSending}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="ai-chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tanya tentang setor limbah..."
              disabled={isSending}
              aria-label="Ketik pesan ke asisten AI"
            />
            <button type="submit" disabled={!input.trim() || isSending}>
              <SendHorizontal className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="ai-chat-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Tutup asisten AI' : 'Buka asisten AI'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
