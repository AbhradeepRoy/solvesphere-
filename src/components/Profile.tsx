import { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Award, 
  Zap, 
  Star, 
  Edit3, 
  Save, 
  Camera, 
  Upload, 
  CheckCircle2,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useUser } from "../hooks/useUser";

export default function Profile() {
  const { profile, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.displayName || "");
  const [avatar, setAvatar] = useState(profile?.photoURL || "");

  const handleSave = async () => {
    await updateProfile({ displayName: name, photoURL: avatar });
    setIsEditing(false);
  };

  const level = Math.floor((profile?.xp || 0) / 1000) + 1;
  const progress = ((profile?.xp || 0) % 1000) / 10;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-8 pb-8 -mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl relative overflow-hidden">
                  <img 
                    src={avatar || profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} 
                    alt="avatar" 
                    className="w-full h-full object-cover rounded-[2rem] bg-gray-50" 
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white opacity-80" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your Name"
                      className="text-3xl font-extrabold text-gray-900 border-b-2 border-indigo-600 outline-none w-full bg-transparent"
                    />
                    <input 
                      value={avatar} 
                      onChange={(e) => setAvatar(e.target.value)} 
                      placeholder="Avatar Image URL (optional)"
                      className="text-xs text-gray-400 border border-gray-100 rounded-lg p-2 w-full bg-gray-50"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{profile?.displayName}</h1>
                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Scholar Level {level}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <button 
                  onClick={handleSave} 
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                  id="profile-save-btn"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  id="profile-edit-btn"
                >
                  <Edit3 className="w-5 h-5" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Zap, label: "Streak", value: `${profile?.streak || 0}d`, color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Award, label: "Total XP", value: profile?.xp.toLocaleString() || "0", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: CheckCircle2, label: "Solved", value: "24", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: Calendar, label: "Joined", value: "April '24", color: "text-blue-500", bg: "bg-blue-50" },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-100 transition-all">
                <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Achievements
          </h2>
          <div className="space-y-4">
            {profile?.badges.length ? profile.badges.map((badge, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl group overflow-hidden relative"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900">{badge}</h4>
                    <p className="text-[10px] text-amber-700/60 uppercase font-extrabold tracking-widest">Mastery Unlocked</p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-amber-200/20 rounded-full absolute -right-6 -bottom-6 blur-2xl" />
              </motion.div>
            )) : (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 font-medium italic">Complete 100% of a quiz to earn your first mastery badge!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Learning Activity</h2>
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">Current Level Progress</span>
                <span className="text-sm font-bold text-indigo-600">{Math.floor(progress)}%</span>
             </div>
             <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-100" 
                />
             </div>
             <p className="text-xs text-center text-gray-400">Keep solving to reach Level {level + 1}</p>
             
             <div className="pt-8 border-t border-gray-100 mt-4">
                <h4 className="font-bold mb-4">Skill Distribution</h4>
                <div className="space-y-4">
                   {[
                     { label: "STEM & Logic", color: "bg-blue-500", w: "85%" },
                     { label: "Humanities", color: "bg-purple-500", w: "45%" },
                     { label: "Practical Skills", color: "bg-emerald-500", w: "60%" }
                   ].map((skill, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-400 w-24 uppercase truncate">{skill.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-50 rounded-full">
                           <div className={`h-full ${skill.color} rounded-full`} style={{ width: skill.w }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
