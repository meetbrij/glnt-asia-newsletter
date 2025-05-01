

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  BarChart3, 
  FileText, 
  CheckSquare,
  Mail,
  ChevronDown,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        // Redirect based on role if on wrong page
        if (userData.role === "reader" && !currentPageName.startsWith("Newsletter")) {
          navigate(createPageUrl("Newsletter"));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If we can't get the user data, they're not logged in
        // User.login(); // This will redirect to the built-in login page
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [currentPageName, navigate]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.full_name) return "U";
    return user.full_name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload(); // Reload to trigger login flow
  };

  // Current view (analyst, manager, reader)
  const [currentView, setCurrentView] = useState("analyst");

  useEffect(() => {
    if (user) {
      setCurrentView(user.role || "analyst");
    }
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="hidden md:block w-[256px] bg-[#e8eeff] p-4">
          <Skeleton className="h-10 w-10 rounded-full mb-6" />
          <Skeleton className="h-4 w-40 mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-6 w-96 m-8" />
          <div className="p-8">
            <Skeleton className="h-40 w-full mb-6" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-[256px] bg-[#e8eeff] flex-shrink-0 border-r border-indigo-100 fixed h-full overflow-auto">
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center mb-4">
            <div className="bg-indigo-600 text-white h-10 w-10 flex items-center justify-center rounded-full">
              <span className="text-lg font-bold">N</span>
            </div>
            <span className="ml-2 text-xl font-bold text-indigo-900">NewsAnalyst</span>
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
              label="Selected News" 
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
              current={currentPageName === "ManagerDashboard" || currentPageName === "ContentPerformance" || currentPageName === "ReaderEngagement"}
            />
          </nav>
        </div>
        
        {/* View Switcher */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-100">
          <div className="mb-2 text-xs text-indigo-800 font-medium">
            Switch View
          </div>
          <div className="flex bg-white rounded-md p-1 mb-4">
            <ViewButton 
              label="Analyst" 
              active={currentView === "analyst"} 
              onClick={() => setCurrentView("analyst")}
            />
            <ViewButton 
              label="Manager" 
              active={currentView === "manager"} 
              onClick={() => setCurrentView("manager")}
            />
            <ViewButton 
              label="Reader" 
              active={currentView === "reader"} 
              onClick={() => setCurrentView("reader")}
            />
          </div>
          
          {/* User Profile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-9 w-9 bg-indigo-100 text-indigo-600 border border-indigo-200">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <div className="text-sm font-medium text-indigo-900">
                  {user?.full_name?.split(' ').slice(0, 2).join(' ') || "User"}
                </div>
                <div className="text-xs text-indigo-700 truncate max-w-[180px]">
                  {user?.email || "user@example.com"}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 h-auto"
              onClick={() => {}}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-[256px] flex-1 min-h-screen overflow-auto">
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

function ViewButton({ label, active, onClick }) {
  return (
    <button
      className={`flex-1 py-1 px-3 text-sm rounded-md transition-colors ${
        active ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-indigo-900 hover:bg-indigo-50'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

