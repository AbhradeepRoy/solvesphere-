import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Zap, 
  Award, 
  History, 
  ChevronRight, 
  BookOpen, 
  Video, 
  Layout, 
  Mic,
  Star
} from "lucide-react";
import { useUser } from "../hooks/useUser";
import { db } from "../lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Solution } from "../types";

export default function Dashboard() {
  const { profile } = useUser();
  const [recentSolutions, setRecentSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecents() {
      if (!profile?.uid) return;
      try {
        const q = query(
          collection(db, "solutions"),
          where("userId", "==", profile.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solution));
        setRecentSolutions(docs);
      } catch (err) {
        console.error("Failed to fetch recent solutions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecents();
  }, [profile?.uid]);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Hi, {profile?.displayName?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Ready to master a new topic today?</p>
        </div>
        
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 shadow-sm">
            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold">{profile?.streak || 0} Day Streak</span>
          </div>
          <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100">
            <Star className="w-5 h-5 fill-white" />
            <span className="font-bold">{profile?.xp || 0} XP</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h3 className="text-white/80 font-semibold mb-1 uppercase text-xs tracking-wider">Level Progress</h3>
            <p className="text-4xl font-bold mb-4">Lvl {Math.floor((profile?.xp || 0) / 1000) + 1}</p>
            <div className="w-full h-2 bg-white/20 rounded-full">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${((profile?.xp || 0) % 1000) / 10}%` }} 
              />
            </div>
            <p className="mt-2 text-xs text-white/60 font-medium">
              {1000 - ((profile?.xp || 0) % 1000)} XP to reach next level
            </p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-24 h-24" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wider">Solving Modes</h3>
          <div className="flex gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Video className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700">Choose your style, learn your way.</p>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
          <h3 className="text-gray-400 font-semibold mb-1 uppercase text-xs tracking-wider">Latest Achievement</h3>
          {profile?.badges?.length ? (
            <div className="flex items-center gap-3 mt-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <span className="font-bold text-gray-900">{profile.badges[profile.badges.length - 1]}</span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400 italic">No badges yet. Start solving!</p>
          )}
        </div>
      </div>

      {/* Recent Solutions Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recent Solutions</h2>
          </div>
          <Link to="/solve" className="text-sm font-bold text-indigo-600 hover:underline">See All</Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-10 text-center text-gray-400">Loading your history...</div>
          ) : recentSolutions.length > 0 ? (
            recentSolutions.map((sol) => (
              <Link 
                key={sol.id} 
                to={`/solve?id=${sol.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition-all group"
                id={`recent-sol-${sol.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    {sol.queryType === "image" ? <Layout className="w-5 h-5 text-purple-600" /> : <BookOpen className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{sol.query}</h4>
                    <p className="text-xs text-gray-500 font-medium">{new Date(sol.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-gray-900 font-bold">No solutions yet</h4>
              <p className="text-gray-400 text-sm max-w-xs mt-1">Upload a photo of your doubt or type it out to get started!</p>
              <Link to="/solve" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Solve My First Doubt</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
