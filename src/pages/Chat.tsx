import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/cn'
import axios from 'axios'

const suggestions = [
  'Como reduzir o retrabalho na minha equipe?',
  'Quais são os maiores gargalos do meu processo?',
  'Como criar um checklist eficiente para abertura?',
  'Como melhorar o atendimento ao cliente?',
]

export function Chat() {
  const { user, company, messages, addMessage, onboardingAnswers } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const systemPrompt = `Você é o ProcessAI, um consultor especialista em melhoria de processos empresariais para empresas brasileiras.
Você conhece as seguintes informações sobre a empresa do usuário:
- Empresa: ${company?.name ?? 'Não informado'}
- Setor: ${company?.sector ?? 'Não informado'}
- Respostas do diagnóstico: ${onboardingAnswers.map((a) => `${a.question}: ${a.answer}`).join('; ')}

Seu papel:
- Responder de forma clara, objetiva e prática em português brasileiro
- Sugerir melhorias baseadas em BPM, Lean, Six Sigma, 5S e PDCA
- Criar checklists, SOPs e planos de ação quando pedido
- Adaptar as respostas ao setor específico da empresa
- Ser direto e motivador, como um consultor acessível
- Resposta em formato de tópicos quando possível, fácil de ler no celular`

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      created_at: new Date().toISOString(),
    }
    addMessage(userMsg)
    setLoading(true)

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const { data } = await axios.post('/api/chat', {
        system: systemPrompt,
        messages: [...history, { role: 'user', content: text }],
      })

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.content,
        created_at: new Date().toISOString(),
      }
      addMessage(assistantMsg)
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, não consegui processar sua mensagem. Verifique a conexão e tente novamente.',
        created_at: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const adjustTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto">
      {/* Header */}
      <div className="glass border-b border-white/6 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">ProcessAI</p>
          <p className="text-[10px] text-emerald-400">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-white" />
            </div>
            <p className="text-white font-semibold mb-1">Olá, {user?.name?.split(' ')[0]}!</p>
            <p className="text-slate-400 text-sm mb-6">Sou seu consultor de processos com IA. Como posso ajudar sua empresa hoje?</p>

            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left bg-[#1E1E2E] border border-white/6 rounded-xl px-4 py-3 text-sm text-slate-300 hover:border-indigo-500/40 transition-all active:scale-98"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={13} className="text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-[#1E1E2E] text-slate-200 rounded-tl-sm border border-white/6'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#2A2A3E] flex items-center justify-center shrink-0 mt-0.5">
                <User size={13} className="text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-[#1E1E2E] border border-white/6 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-white/6 px-4 pt-3 pb-4 safe-bottom shrink-0">
        <div className="flex items-end gap-2 bg-[#1E1E2E] border border-white/10 rounded-2xl px-3 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustTextarea() }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Pergunte sobre seus processos..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 resize-none focus:outline-none text-sm leading-relaxed max-h-[120px] py-1"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-90"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
