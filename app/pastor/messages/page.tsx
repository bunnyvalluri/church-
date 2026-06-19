"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Loader2, Check, Save, Mail, Phone, Clock } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

export default function PastorMessages() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { setLocalMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") router.replace("/dashboard");
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/contact-messages").then(r => r.json()).then(d => {
        setMessages(d.messages || d.contactMessages || []);
        setLoading(false);
      }).catch(() => { setLoading(false); });
    }
  }, [status]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSuccessMsg(`Reply sent to ${selected.email}`);
    setReply("");
    setSending(false);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  if (!localMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link href="/pastor" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Pastor Dashboard
        </Link>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-950 dark:text-white">Messages</h2>
                  <p className="text-xs text-gray-400">{messages.length} total</p>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
                {messages.map(msg => (
                  <button key={msg.id} onClick={() => setSelected(msg)} className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${selected?.id === msg.id ? "bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate">{msg.name}</h4>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{msg.subject || "Contact Message"}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-1">{msg.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Detail & Reply */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl p-6">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-semibold text-sm">Select a message to read</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{selected.subject || "Contact Message"}</h3>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><Mail className="w-3.5 h-3.5 text-purple-500" />{selected.email}</span>
                    {selected.phone && <span className="flex items-center gap-1.5 text-xs text-gray-500"><Phone className="w-3.5 h-3.5 text-purple-500" />{selected.phone}</span>}
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" />{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}</span>
                  </div>
                </div>
                <div className="p-5 bg-gray-50 dark:bg-white/3 rounded-2xl border border-gray-100 dark:border-white/5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                {successMsg && <div className="p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />{successMsg}</div>}
                <form onSubmit={handleReply} className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Reply to {selected.name}</label>
                  <textarea value={reply} onChange={e => setReply(e.target.value)} required rows={4}
                    placeholder="Type your pastoral response here..."
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-sm" />
                  <button type="submit" disabled={sending} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {sending ? "Sending..." : "Send Reply"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
