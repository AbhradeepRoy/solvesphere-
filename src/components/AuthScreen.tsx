import { motion } from "motion/react";
import { signInWithGoogle } from "../lib/firebase";
import { LogIn, Sparkles, BookOpen, Mic, PlayCircle } from "lucide-react";

export function AuthScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full"
      >
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          SolveSphere AI
        </h1>
        <p className="text-gray-600 text-lg mb-12">
          Your personal AI tutor for 360° academic excellence.
          Scan, Speak, or Ask to solve anything.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          {[
            { icon: BookOpen, label: "Text Solution" },
            { icon: PlayCircle, label: "Slide & Video" },
            { icon: Mic, label: "Voice Explain" },
            { icon: Sparkles, label: "AI Tutors" },
          ].map((feature, i) => (
            <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center">
              <feature.icon className="w-6 h-6 text-indigo-600 mb-2" />
              <span className="text-xs font-semibold text-gray-700">{feature.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full py-4 px-6 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200"
          id="google-login-btn"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>
        
        <p className="mt-8 text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
