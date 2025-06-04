"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { Send, MessageCircle, Loader2, Smile, Paperclip } from "lucide-react"

interface Message {
  id: string
  contenu: string
  created_at: string
  id_utilisateur: string
  id_mission: string
  utilisateurs: {
    id: string
    nom: string
    avatar?: string
    role?: number
  }
}

interface ChatRoomProps {
  missionId: string
  currentUserId: string
}

export default function ChatRoom({ missionId, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*, utilisateurs(id, nom, avatar, role)")
          .eq("id_mission", missionId)
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Erreur chargement messages:", error)
        } else if (data) {
          setMessages(data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel("messages-listen")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `id_mission=eq.${missionId}`,
        },
        async (payload) => {
          try {
            const { data, error } = await supabase
              .from("messages")
              .select("*, utilisateurs(id, nom, avatar, role)")
              .eq("id", payload.new.id)
              .single()

            if (!error && data) {
              setMessages((prev) => [...prev, data])
            }
          } catch (error) {
            console.error("Erreur lors de la réception du message:", error)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [missionId])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = async () => {
    if (newMessage.trim() === "" || sending) return

    setSending(true)
    try {
      const { error } = await supabase.from("messages").insert({
        id_mission: missionId,
        contenu: newMessage.trim(),
        id_utilisateur: currentUserId,
      })

      if (error) {
        console.error("Erreur envoi message:", error)
        alert("Erreur lors de l'envoi du message")
      } else {
        setNewMessage("")
        inputRef.current?.focus()
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    }
  }

  const getRoleColor = (role?: number) => {
    switch (role) {
      case 1:
        return "text-[#52c1ff]" // Freelance
      case 2:
        return "text-[#ffbb88]" // Entreprise
      default:
        return "text-gray-600"
    }
  }

  const getRoleLabel = (role?: number) => {
    switch (role) {
      case 1:
        return "Freelance"
      case 2:
        return "Entreprise"
      default:
        return "Utilisateur"
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col h-[600px]">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#52c1ff]" />
            <p className="text-gray-600">Chargement de la conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#52c1ff] rounded-2xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Communication du projet</h3>
            <p className="text-sm text-gray-600">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun message</h4>
              <p className="text-gray-600 text-sm">Commencez la conversation en envoyant le premier message !</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.id_utilisateur === currentUserId
            const avatar = msg.utilisateurs?.avatar || "/placeholder.svg?height=40&width=40"
            const nom = msg.utilisateurs?.nom || "Utilisateur"
            const role = msg.utilisateurs?.role
            const showAvatar = idx === 0 || messages[idx - 1].id_utilisateur !== msg.id_utilisateur

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                <div className={`flex gap-3 max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    <img
                      src={avatar || "/placeholder.svg"}
                      alt={nom}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white shadow-lg"
                    />
                  </div>

                  {/* Message */}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {showAvatar && (
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <span className={`text-sm font-semibold ${getRoleColor(role)}`}>{nom}</span>
                        <span className="text-xs text-gray-500">{getRoleLabel(role)}</span>
                      </div>
                    )}

                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                        isMe
                          ? "bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/90 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      } ${showAvatar ? "" : "mt-1"}`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.contenu}</p>

                      {/* Timestamp */}
                      <div
                        className={`text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isMe ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>

                      {/* Message tail */}
                      {showAvatar && (
                        <div
                          className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                            isMe
                              ? "right-[-6px] bg-gradient-to-r from-[#52c1ff] to-[#52c1ff]/90"
                              : "left-[-6px] bg-white border-l border-b border-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-white/20 p-6">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tapez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#52c1ff] focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-[#52c1ff] transition-colors"
                title="Ajouter un emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-[#ffbb88] transition-colors"
                title="Joindre un fichier"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={sendMessage}
            disabled={newMessage.trim() === "" || sending}
            className="bg-[#52c1ff]  hover:from-[#52c1ff]/90 hover:to-[#ffbb88]/90 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-2xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center min-w-[48px]"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Typing indicator placeholder */}
        <div className="mt-2 h-4 flex items-center">
          <span className="text-xs text-gray-500 opacity-0">Quelqu'un est en train d'écrire...</span>
        </div>
      </div>
    </div>
  )
}
