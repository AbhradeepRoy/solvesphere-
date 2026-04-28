import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Mic, 
  Send, 
  Image as ImageIcon, 
  X, 
  Loader2,
  FileText,
  Video,
  Presentation,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles
} from "lucide-react";
import { useUser } from "../hooks/useUser";
import { db } from "../lib/firebase";
import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import ai, { models } from "../lib/gemini";
import Markdown from "react-markdown";
import { QueryType, Solution, Slide, QuizQuestion } from "../types";
import { Type } from "@google/genai";
import SlidesViewer from "./SlidesViewer";
import QuizSystem from "./QuizSystem";

export default function DoubtSolver() {
  const { profile, addXP } = useUser();
  const [searchParams] = useSearchParams();
  const solId = searchParams.get("id");

  const [query, setQuery] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [mode, setMode] = useState<"text" | "slides" | "quiz" | "video">("text");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (solId) {
      loadSolution(solId);
    }
  }, [solId]);

  async function loadSolution(id: string) {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "solutions", id));
      if (docSnap.exists()) {
        setSolution(docSnap.data() as Solution);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setShowOptionsModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  async function solveDoubt(selectedMode?: string) {
    if (!query && !image) return;
    setLoading(true);
    setShowOptionsModal(false);

    try {
      const prompt = `
        Solve the following academic doubt. 
        If there's an image, perform OCR first.
        Query: ${query}
        
        Return a JSON object with:
        - topic: short title
        - explanation: clear step-by-step text
        - slides: an array of 5 slides, each with {title, content (array of strings)}
        - quiz: an array of 3 MCQs, each with {question, options (array), correctAnswer (index)}
      `;

      const contents: any[] = [{ text: prompt }];
      if (image) {
        contents.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: image.split(",")[1],
          }
        });
      }

      const res = await ai.models.generateContent({
        model: models.pro,
        contents: { parts: contents },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              explanation: { type: Type.STRING },
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.NUMBER }
                  }
                }
              }
            },
            required: ["topic", "explanation", "slides", "quiz"]
          }
        }
      });

      const data = JSON.parse(res.text);
      const newSolution: Solution = {
        userId: profile?.uid || "anon",
        query: query || "Image Query",
        queryType: image ? QueryType.IMAGE : QueryType.TEXT,
        explanation: data.explanation,
        slides: data.slides,
        quiz: data.quiz,
        topic: data.topic,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "solutions"), {
        ...newSolution,
        createdAt: serverTimestamp()
      });

      setSolution({ ...newSolution, id: docRef.id });
      setMode((selectedMode as any) || "text");
      addXP(50); // Solving a doubt adds XP
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function translateContent(lang: string) {
    if (!solution) return;
    setLoading(true);
    try {
      const res = await ai.models.generateContent({
        model: models.flash,
        contents: `Translate the following explanation to ${lang}. Keep markdown structure: ${solution.explanation}`
      });
      setSolution({ ...solution, explanation: res.text || solution.explanation });
      setCurrentLanguage(lang);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-2">
      {!solution ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            What are we learning today?
          </h2>

          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question here, upload a photo, or use voice..."
                className="w-full min-h-[160px] p-6 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 resize-none text-lg"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>

            {image && (
              <div className="relative inline-block">
                <img src={image} alt="preview" className="h-32 w-auto rounded-xl border border-gray-200" />
                <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-100">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}

            <button
              onClick={() => solveDoubt("text")}
              disabled={loading || (!query && !image)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
              id="send-doubt-btn"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Analyzing..." : "Find Solution"}
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setSolution(null)} className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-indigo-600">
              <ChevronLeft className="w-4 h-4" /> New Query
            </button>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {[
                { id: "text", icon: FileText, label: "Text" },
                { id: "slides", icon: Presentation, label: "Slides" },
                { id: "video", icon: Video, label: "Video" },
                { id: "quiz", icon: CheckCircle2, label: "Quiz" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}
                  id={`mode-tab-${t.id}`}
                >
                  <t.icon className="w-4 h-4" /> <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[500px]">
            {loading && <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>}
            
            {!loading && mode === "text" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{solution.topic}</h2>
                  <select 
                    value={currentLanguage}
                    onChange={(e) => translateContent(e.target.value)}
                    className="p-2 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="hi">Hindi</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="prose prose-indigo max-w-none prose-p:text-gray-600 prose-headings:text-gray-900">
                  <Markdown>{solution.explanation}</Markdown>
                </div>
              </div>
            )}

            {!loading && mode === "slides" && <SlidesViewer slides={solution.slides} />}
            {!loading && mode === "video" && <VideoSim slides={solution.slides} text={solution.explanation} />}
            {!loading && mode === "quiz" && <QuizSystem questions={solution.quiz} topic={solution.topic} />}
          </div>
        </motion.div>
      )}

      {/* Options Modal */}
      <AnimatePresence>
        {showOptionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowOptionsModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-6 text-center">Choose Learning Format</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "text", icon: FileText, label: "Text Solution", desc: "Detailed step-by-step" },
                  { id: "slides", icon: Presentation, label: "Slideshow", desc: "Visual key points" },
                  { id: "video", icon: Video, label: "Video Explanation", desc: "Animated tutorial" },
                  { id: "voice", icon: Volume2, label: "Voice Explain", desc: "Listen & learn" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => solveDoubt(opt.id)}
                    className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left flex flex-col group"
                  >
                    <opt.icon className="w-6 h-6 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-gray-900">{opt.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoSim({ slides, text }: { slides: Slide[], text: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">{slides[currentSlide].title}</h3>
            <ul className="space-y-4">
              {slides[currentSlide].content.map((point, i) => (
                <motion.li 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: i * 0.5 }} 
                  key={i} 
                  className="text-indigo-200 text-lg font-medium"
                >
                  • {point}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 flex gap-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>
      <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">AI Narrator Is Explaining...</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 italic">"{text.substring(0, 300)}..."</p>
      </div>
    </div>
  );
}
