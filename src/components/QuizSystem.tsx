import { useState } from "react";
import { QuizQuestion } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Award, RefreshCw, ChevronRight } from "lucide-react";
import { useUser } from "../hooks/useUser";
import confetti from "canvas-confetti";

interface QuizProps {
  questions: QuizQuestion[];
  topic: string;
}

export default function QuizSystem({ questions, topic }: QuizProps) {
  const { profile, addXP, updateProfile } = useUser();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    setIsAnswered(true);
    if (idx === questions[current].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setShowResult(true);
    const finalScore = score + (selected === questions[current].correctAnswer ? 1 : 0);
    const xpGained = finalScore * 20;
    addXP(xpGained);

    if (finalScore === questions.length) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const badgeName = `${topic} Master`;
      if (!profile?.badges.includes(badgeName)) {
        const newBadges = [...(profile?.badges || []), badgeName];
        updateProfile({ badges: newBadges });
      }
    }
  };

  if (showResult) {
    const isPerfect = score === questions.length;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8 font-medium">You scored {score} out of {questions.length}</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 w-full max-w-xs mx-auto">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">XP Earned</p>
            <p className="text-4xl font-extrabold text-indigo-600">+{score * 20}</p>
          </div>

          {isPerfect && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-amber-800 font-bold mb-1 italic">Perfect Score! 🌟</p>
              <p className="text-amber-700 text-xs">New Badge Unlocked: {topic} Master</p>
            </div>
          )}

          <button
            onClick={() => {
              setCurrent(0);
              setScore(0);
              setSelected(null);
              setIsAnswered(false);
              setShowResult(false);
            }}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <RefreshCw className="w-5 h-5" /> Retake Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[current];

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Question {current + 1} of {questions.length}</p>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{currentQ.question}</h2>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600" 
            initial={{ width: 0 }}
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {currentQ.options.map((option, idx) => {
          let stateClass = "bg-white border-gray-200 text-gray-700 hover:border-indigo-600 hover:bg-indigo-50";
          if (isAnswered) {
            if (idx === currentQ.correctAnswer) stateClass = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold";
            else if (selected === idx) stateClass = "bg-red-50 border-red-500 text-red-700";
            else stateClass = "bg-white border-gray-100 text-gray-300 opacity-50";
          } else if (selected === idx) {
            stateClass = "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-md shadow-indigo-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${stateClass}`}
              disabled={isAnswered}
            >
              <span className="text-lg">{option}</span>
              {isAnswered && idx === currentQ.correctAnswer && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {isAnswered && selected === idx && idx !== currentQ.correctAnswer && <XCircle className="w-6 h-6 text-red-500" />}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
          id="quiz-next-btn"
        >
          {current === questions.length - 1 ? "Finish Quiz" : "Next Question"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
