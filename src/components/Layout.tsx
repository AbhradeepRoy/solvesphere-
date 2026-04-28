import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Settings, 
  PlusCircle, 
  Sparkles,
  Award,
  Zap
} from "lucide-react";
import { useUser } from "../hooks/useUser";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { profile } = useUser();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Solve", path: "/solve" },
    { icon: MessageSquare, label: "Tutors", path: "/tutor" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-black font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SolveSphere</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-bold" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                id={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Stats Summary */}
        <div className="mt-auto space-y-4 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-sm font-bold text-orange-700">Streak: {profile?.streak || 0}</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-amber-700">XP: {profile?.xp || 0}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span className="font-bold">SolveSphere</span>
          </div>
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
            <img src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} alt="profile" />
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center justify-around p-4 bg-white border-t border-gray-200">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`p-2 ${location.pathname === item.path ? "text-indigo-600" : "text-gray-400"}`}>
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </nav>

        {/* FAB for Quick Scan */}
        <Link 
          to="/solve" 
          className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-200 hover:scale-110 transition-transform z-40"
          id="fab-scan"
        >
          <PlusCircle className="w-8 h-8" />
        </Link>
      </main>
    </div>
  );
}
