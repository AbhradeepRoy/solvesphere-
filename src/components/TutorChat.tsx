import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  ChevronLeft, 
  Mic, 
  Loader2,
  Brain,
  Zap,
  Coffee,
  Globe,
  Settings2
} from "lucide-react";
import { useUser } from "../hooks/useUser";
import { db } from "../lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, onSnapshot, limit } from "firebase/firestore";
import ai, { models } from "../lib/gemini";
import Markdown from "react-markdown";
import { ChatMessage, Tutor } from "../types";

const TUTORS: Tutor[] = [
  { id: "stella", name: "Stella", role: "Science Guru", personality: "Friendly & Enthusiastic", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stella" },
  { id: "max", name: "Max", role: "Math Whiz", personality: "Logical & Direct", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=max" },
  { id: "sophia", name: "Sophia", role: "Literature Expert", personality: "Eloquent & Imaginative", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophia" },
  { id: "kai", name: "Kai", role: "Coding Coach", personality: "Pragmatic & Resourceful", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kai" },
];

export default function TutorChat() {
  const { profile } = useUser();
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTutor && profile?.uid) {
      const q = query(
        collection(db, "users", profile.uid, "messages"),
        where("tutorId", "==", selectedTutor.id),
        orderBy("createdAt", "asc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [selectedTutor, profile?.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !selectedTutor || !profile) return;
    
    const userMsg: ChatMessage = {
      userId: profile.uid,
      role: "user",
      content: input,
      tutorId: selectedTutor.id,
      createdAt: new Date().toISOString()
    };

    setInput("");
    setLoading(true);

    try {
      await addDoc(collection(db, "users", profile.uid, "messages"), {
        ...userMsg,
        createdAt: serverTimestamp()
      });

      // Generate AI Response
      const history = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n");
      const prompt = `
        You are ${selectedTutor.name}, the ${selectedTutor.role}. 
        Personality: ${selectedTutor.personality}.
        Context: ${history}
        User Query: ${input}

        Keep your responses educational, encouraging, and in alignment with your personality.
        Use markdown for formatting.
      `;

      const res = await ai.models.generateContent({
        model: models.flash,
        contents: prompt
      });

      const aiMsg: ChatMessage = {
        userId: profile.uid,
        role: "assistant",
        content: res.text || "I'm sorry, I couldn't process that.",
        tutorId: selectedTutor.id,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "users", profile.uid, "messages"), {
        ...aiMsg,
        createdAt: serverTimestamp()
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!selectedTutor) {
    return (
      <div className="max-w-4xl mx-auto pb-20">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">AI Tutors</h1>
        <p className="text-gray-500 mb-8">Choose a specialist to help you master specific subjects.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TUTORS.map((tutor) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={tutor.id}
              onClick={() => setSelectedTutor(tutor)}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left flex gap-5 hover:border-indigo-600 transition-all group"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
                <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">{tutor.name}</h3>
                  <div className="px-2 py-0.5 bg-indigo-50 text-[10px] text-indigo-600 font-extrabold rounded-md uppercase tracking-widest">{tutor.role}</div>
                </div>
                <p className="text-sm text-gray-500 font-medium">{tutor.personality}</p>
                <div className="mt-4 flex gap-2">
                   <div className="p-1.5 bg-gray-50 rounded-lg"><Zap className="w-3 h-3 text-amber-500" /></div>
                   <div className="p-1.5 bg-gray-50 rounded-lg"><Brain className="w-3 h-3 text-purple-500" /></div>
                   <div className="p-1.5 bg-gray-50 rounded-lg"><Coffee className="w-3 h-3 text-orange-500" /></div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      {/* Tutor Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedTutor(null)} className="p-2 hover:bg-gray-50 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <img src={selectedTutor.avatar} alt={selectedTutor.name} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 tracking-tight leading-none">{selectedTutor.name}</h3>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{selectedTutor.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Online
          </div>
          <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 px-2 mb-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
             </div>
             <p className="font-bold text-gray-900">Start your session with {selectedTutor.name}</p>
             <p className="text-sm text-gray-500 max-w-xs mt-2">Ask a doubt, request a simple explanation, or even get quiz practice!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] sm:max-w-[70%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-100" 
                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
            }`}>
              <div className="prose prose-sm prose-p:my-1 prose-headings:text-inherit prose-strong:text-inherit">
                <Markdown>{msg.content}</Markdown>
              </div>
              <div className={`text-[10px] mt-2 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="p-5 bg-white border border-gray-100 rounded-3xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
        <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-indigo-600 transition-colors">
          <Mic className="w-5 h-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={`Type and ask ${selectedTutor.name}...`}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium tracking-tight"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
          id="tutor-send-btn"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  );
}
