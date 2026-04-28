import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SolveSphere AI</h1>
        <p className="text-gray-500 mt-2">Preparing your learning workspace...</p>
      </motion.div>
    </div>
  );
}
