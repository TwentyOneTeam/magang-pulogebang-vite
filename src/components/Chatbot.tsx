import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Header } from './Header';
import { Footer } from './Footer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bot, Send, User, AlertCircle } from 'lucide-react';
import { chatAPI } from '../services/api';
import { Alert, AlertDescription } from './ui/alert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya Asisten AI Kelurahan Pulo Gebang yang didukung oleh Google Gemini AI. Saya siap membantu Anda dengan informasi tentang program magang. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      // Kirim ke backend untuk diproses oleh Gemini AI
      const response = await chatAPI.sendMessage(inputMessage, messages);
      
      if (response.success && response.data) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error(response.message || 'Gagal mendapatkan respons dari AI');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('Maaf, terjadi kesalahan. Silakan coba lagi.');
      
      // Fallback response jika API gagal
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, saya sedang mengalami gangguan koneksi. Silakan coba beberapa saat lagi atau hubungi admin untuk bantuan lebih lanjut.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'Apa saja persyaratan untuk mendaftar magang?',
    'Berapa lama durasi magang?',
    'Bagaimana cara mendaftar magang?',
    'Divisi apa saja yang tersedia?',
  ];

  const handleSuggestedClick = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F4F4]">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#004AAD] rounded-full mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-[#004AAD] mb-2">Chatbot AI</h1>
            <p className="text-gray-600">
              Tanyakan apa saja tentang program magang kepada asisten AI kami
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Chat Container */}
          <Card className="shadow-lg overflow-hidden">
            {/* Chat Messages */}
            <div
              ref={scrollRef}
              className="h-[500px] overflow-y-auto p-6 space-y-4 bg-white"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 bg-[#004AAD] rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-[#004AAD] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => (
                            <strong className="font-bold" {...props} />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic" {...props} />
                          ),
                          code: ({ inline, ...props }: any) => (
                            <code
                              className={`${
                                inline
                                  ? 'bg-gray-200 px-1 rounded text-sm'
                                  : 'block bg-gray-200 p-2 rounded my-2 overflow-x-auto'
                              }`}
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-inside my-2" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal list-inside my-2" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="my-1" {...props} />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1 className="text-xl font-bold my-2" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-lg font-bold my-2" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-base font-bold my-2" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-1" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-gray-300 pl-4 italic my-2"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className="underline hover:opacity-80"
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-[#004AAD] rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t">
                <p className="text-sm text-gray-600 mb-3">Pertanyaan yang sering diajukan:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedClick(question)}
                      className="text-sm bg-white border border-gray-300 hover:border-[#004AAD] hover:text-[#004AAD] rounded-lg px-3 py-2 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ketik pesan Anda..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-[#004AAD] hover:bg-[#003580] px-6"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tekan Enter untuk mengirim, Shift+Enter untuk baris baru
              </p>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-[#004AAD]" />
              </div>
              <div>
                <h3 className="text-[#004AAD] mb-2">Tentang AI Chatbot Ini</h3>
                <p className="text-sm text-gray-700">
                  Chatbot ini menggunakan <strong>Google Gemini AI</strong> untuk memberikan jawaban cerdas dan kontekstual tentang program magang di Kelurahan Pulo Gebang. AI akan belajar dari percakapan untuk memberikan respons yang lebih baik.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
