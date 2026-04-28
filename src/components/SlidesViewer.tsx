import { useState } from "react";
import { Slide } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SlidesViewer({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden shadow-inner p-4 md:p-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">{slides[current].title}</h2>
            <div className="space-y-6 text-left">
              {slides[current].content.map((point, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1.5 w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
                  <p className="text-lg text-gray-700 font-medium leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6">
        <div className="text-sm font-bold text-gray-400">
          Slide {current + 1} of {slides.length}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="p-3 rounded-xl bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))}
            disabled={current === slides.length - 1}
            className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
