'use client'

import { useState } from 'react'
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you with lead scoring, email drafts, and insights. How can I help you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    // TODO: Connect to actual AI backend
    // For now, simulate a response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: getPlaceholderResponse(userMessage),
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  const getPlaceholderResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('score') || lowerQuery.includes('lead')) {
      return "I can help you score leads! To get an AI-powered lead score, go to the lead's detail page and click on 'Get AI Score'. I analyze factors like budget, engagement level, and source to predict conversion probability."
    }

    if (lowerQuery.includes('email') || lowerQuery.includes('draft')) {
      return "I can generate email drafts for you! When viewing a lead, click 'Generate Follow-up Email' and I'll create a personalized email based on your conversation history and the lead's interests."
    }

    if (lowerQuery.includes('analytics') || lowerQuery.includes('insight')) {
      return "Based on your current data, here are some insights:\n\n• Your conversion rate is trending upward\n• Referral leads have the highest close rate\n• Most deals close within 30 days of the proposal stage\n\nWould you like me to dive deeper into any of these?"
    }

    if (lowerQuery.includes('help') || lowerQuery.includes('what can')) {
      return "I can help you with:\n\n• **Lead Scoring** - AI-powered probability scoring\n• **Email Drafts** - Generate follow-up emails\n• **Insights** - Analytics and recommendations\n• **Predictions** - Deal closure probability\n• **Content** - Property descriptions\n\nJust ask me about any of these!"
    }

    return "I understand you're asking about " + query.substring(0, 50) + "... This feature is coming soon! In the meantime, I can help with lead scoring, email drafts, or provide insights about your pipeline."
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        suppressHydrationWarning
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Assistant</h3>
            <p className="text-xs text-gray-500">Powered by AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2.5">
              <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-[#D4AF37] hover:bg-[#C4A030] text-black rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
