/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { 
  Layout, 
  PieChart, 
  Target, 
  Timer, 
  Settings, 
  LogOut, 
  ChevronLeft,
  Menu
} from 'lucide-react';
import { MenuType } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  user: User;
}

const LOGO_URL = "/logo.jpeg";

export default function Sidebar({ isOpen, setOpen, activeMenu, setActiveMenu, user }: SidebarProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const menuItems: { id: MenuType; label: string; icon: any; color: string }[] = [
    { id: 'audit', label: 'Audit Program', icon: Layout, color: 'bg-blue-600' },
    { id: 'analytics', label: 'Team Analytics', icon: PieChart, color: 'bg-purple-600' },
    { id: 'accuracy', label: 'Akurasi Project', icon: Target, color: 'bg-emerald-600' },
    { id: 'leadTime', label: 'Lead Time Report', icon: Timer, color: 'bg-indigo-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-slate-700' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl z-20`}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-between h-16">
        {isOpen ? (
          <div className="font-bold text-white text-lg flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <img 
              src={LOGO_URL}
              className="w-8 h-8 object-contain bg-white rounded p-0.5 min-w-[32px]" 
              alt="Logo"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/32x32?text=A";
              }} 
            /> 
            <span>Audit System</span>
          </div>
        ) : (
          <div className="mx-auto">
            <img 
              src={LOGO_URL} 
              className="w-8 h-8 object-contain bg-white rounded p-0.5" 
              alt="Logo" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/32x32?text=A";
              }}
            />
          </div>
        )}
        <button 
          onClick={() => setOpen(!isOpen)} 
          className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition hidden md:block"
        >
          {isOpen ? <ChevronLeft size={18}/> : <Menu size={18}/>}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveMenu(item.id)} 
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              activeMenu === item.id 
                ? `${item.color} text-white shadow-lg` 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon size={20} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white uppercase">
            {user.email ? user.email[0] : 'U'}
          </div>
          {isOpen && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold text-white truncate">
                {user.email ? user.email.split('@')[0] : "User"}
              </div>
              <div className="text-xs text-slate-500 truncate">Online</div>
            </div>
          )}
          {isOpen && (
            <button 
              onClick={handleLogout} 
              className="p-1 hover:text-rose-500 transition" 
              title="Logout"
            >
              <LogOut size={16}/>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
