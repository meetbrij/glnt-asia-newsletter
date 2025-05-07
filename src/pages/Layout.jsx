

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BarChart3, 
  FileText, 
  CheckSquare,
  Mail,
  ChevronDown,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { QuerySupabase } from '@/components/utils/supabaseClient';

export default function Layout({ children, currentPageName }) {

  const [isNewsLetterPage, setIsNewsletterPage] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    console.log("page name: ", currentPageName);
    fetchUserSession();
    if (currentPageName === "Newsletter") {
      setIsNewsletterPage(true);
    }
  }, []);

  const handleLogout = async () => {
    const { error } = await QuerySupabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      // Optional: redirect to login page or home
      window.location.href = '/login';
    }
  };

  const fetchUserSession = async () => {
    const {
      data: { session },
      error,
    } = await QuerySupabase.auth.getSession();
  
    if (error) {
      console.error("Error fetching session:", error);
      return;
    }
  
    const user = session?.user;
    console.log("user info: ", user, email, displayName)
    if (user) {
      setEmail(user.email || "");
      setDisplayName(user.user_metadata?.display_name || user.email.split("@")[0]); // Adjust based on how your metadata is structured
    }
  };

  // Don't show layout for Newsletter page
  if (currentPageName === "Newsletter") {
    return children;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      {!isNewsLetterPage ? (<aside className="w-[256px] bg-[#e8eeff] flex-shrink-0 border-r border-indigo-100 fixed h-full overflow-auto">
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center mb-4 p-4 bg-white">
            <img
              src="/glnt-asia-logo.jpg"
              alt="GLNT ASIA MARKET INTELLIGENCE"
              className="h-7 w-7 object-contain"
            />
            <span className="font-josefin ml-1 sm:text-3xl md:text-xl">
              <span className="font-bold text-gray-800">GLNT</span>
              <span className="text-sky-700 font-normal">ELLIGENCE</span>
            </span>
          </div>
          
          {/* Workspace Title */}
          <div className="text-indigo-900 font-semibold mb-6">
            Analyst Workspace
          </div>
          
          {/* Navigation Links */}
          <nav className="space-y-1">
            <NavLink 
              to="AnalystDashboard" 
              icon={<FileText className="w-5 h-5" />} 
              label="News Dashboard" 
              current={currentPageName === "AnalystDashboard"}
            />
            <NavLink 
              to="SelectedNews" 
              icon={<CheckSquare className="w-5 h-5" />} 
              label="Published News" 
              current={currentPageName === "SelectedNews"}
            />
            <NavLink 
              to="PublishedNewsletters" 
              icon={<Mail className="w-5 h-5" />} 
              label="Published Newsletters" 
              current={currentPageName === "PublishedNewsletters"}
            />
            <NavLink 
              to="ManagerDashboard" 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Analytics View" 
              current={currentPageName === "ManagerDashboard"}
            />
          </nav>
        </div>
        
        {/* View Switcher */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-100">

          {/* User Profile */}
          {email && <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-9 w-9 bg-indigo-100 text-indigo-600 border border-indigo-200">
                <AvatarFallback>{'@'}</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <div className="text-sm font-medium text-indigo-900">
                  {displayName}
                </div>
                <div className="text-xs text-indigo-700 truncate max-w-[180px]">
                  {email}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 h-auto"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>}
        </div>
      </aside>) : (<></>)}
      
      {/* Main Content */}
      <main className={`flex-1 min-h-screen overflow-auto
          ${isNewsLetterPage ? '' : 'ml-[256px]'}`}>
        {children}
      </main>
    </div>
  );
}

// Helper Components
function NavLink({ to, icon, label, current }) {
  return (
    <Link
      to={createPageUrl(to)}
      className={`flex items-center py-2 px-3 rounded-md transition-colors
        ${current ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-900 hover:bg-indigo-50'}`}
    >
      <span className="mr-3">{icon}</span>
      <span className={current ? 'font-medium' : ''}>{label}</span>
    </Link>
  );
}

