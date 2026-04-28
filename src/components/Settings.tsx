import { useState, useEffect } from "react";
import { 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Power, 
  ChevronRight, 
  Heart,
  Eye,
  Type
} from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Sync theme with system and body class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      signOut(auth);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Appearance</h3>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${darkMode ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Dark Mode</h4>
                  <p className="text-xs text-gray-400">Reduce eye strain at night</p>
                </div>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full p-1 transition-all ${darkMode ? "bg-indigo-600" : "bg-gray-200"}`}
                id="theme-toggle"
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 text-gray-400 rounded-xl">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Reduced Font Size</h4>
                  <p className="text-xs text-gray-400">Better fit for smaller screens</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferences</h3>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 text-blue-500 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Default Language</h4>
                  <p className="text-xs text-gray-400">Automatic translation format</p>
                </div>
              </div>
              <span className="text-sm font-bold text-indigo-600">English (US)</span>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${notifications ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Push Notifications</h4>
                  <p className="text-xs text-gray-400">Daily streak reminders</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full p-1 transition-all ${notifications ? "bg-emerald-500" : "bg-gray-200"}`}
                id="notifications-toggle"
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${notifications ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Privacy & Account */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</h3>
          </div>
          <div className="p-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 text-gray-400 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Privacy & Security</h4>
                  <p className="text-xs text-gray-400">Manage data and connections</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">Log Out</h4>
                  <p className="text-xs text-gray-400">Exit your current session</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="text-center pt-8">
           <div className="flex items-center justify-center gap-1.5 text-gray-300 font-bold mb-2">
              <Heart className="w-3 h-3 fill-gray-300" />
              <span className="text-[10px] uppercase tracking-[0.2em]">Crafted for Excellence</span>
           </div>
           <p className="text-[10px] text-gray-400 font-bold">SolveSphere AI v1.0.4 Premium</p>
        </div>
      </div>
    </div>
  );
}
