import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Video, FileText, MessageSquare, BarChart2, Settings } from "lucide-react";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { icon: Video, label: "Meetings", path: "/" },
    { icon: FileText, label: "Expense Reports", path: "/expenses" },
    { icon: MessageSquare, label: "Team Chat", path: "/chat" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];
  
  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-100 bg-white p-4">
      <div className="mb-8 flex items-center">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <Video className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-xl font-semibold">ProcureConnect</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <li key={index}>
                <Link href={item.path} className={cn(
                  "flex items-center rounded-lg px-3 py-2 font-medium",
                  isActive 
                    ? "bg-primary bg-opacity-10 text-primary" 
                    : "text-neutral-600 hover:bg-neutral-50"
                )}>
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-neutral-100 pt-4">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
            <span className="font-medium">
              {user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-800">{user.displayName}</h3>
            <p className="text-xs text-neutral-500">Procurement Manager</p>
          </div>
          <button className="text-neutral-400 hover:text-neutral-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
