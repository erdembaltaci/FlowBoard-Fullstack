import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, User, LifeBuoy, FolderKanban, Users } from 'lucide-react';
import { fileUrl } from "../../lib/fileUrl";

function BottomNav() {
  const navLinkStyles = ({ isActive }) =>
    `flex flex-col items-center gap-1 transition-colors duration-200 w-full pt-2 pb-1 ${
      isActive ? "text-blue-400" : "text-slate-400 hover:text-white"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 flex justify-around items-center z-50">
      <NavLink to="/projects" className={navLinkStyles}>
        <FolderKanban className="h-5 w-5" />
        <span className="text-xs font-medium">Projeler</span>
      </NavLink>
      <NavLink to="/teams" className={navLinkStyles}>
        <Users className="h-5 w-5" />
        <span className="text-xs font-medium">Takımlar</span>
      </NavLink>
    </nav>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const desktopNavLinkStyles = ({ isActive }) =>
    `transition-colors duration-200 ${isActive ? "text-white font-semibold" : "text-slate-400 hover:text-white"}`;

  if (!user) return null;

  return (
    <>
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center p-4 text-white">
          {/* Sol Taraf: Logo ve Masaüstü Navigasyon */}
          <div className="flex items-center gap-8">
            <Link to="/workspace" className="flex items-center gap-2 text-xl font-bold">
              <LayoutDashboard className="text-blue-400" />
              <span>FlowBoard</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <NavLink to="/projects" className={desktopNavLinkStyles}>Projeler</NavLink>
              <NavLink to="/teams" className={desktopNavLinkStyles}>Takımlar</NavLink>
            </nav>
          </div>

          {/* Sağ Taraf: Kullanıcı Menüsü */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 rounded-full p-1 transition-all">
                  <Avatar className="h-8 w-8">
                    {user && user.avatarUrl ? (
                      <AvatarImage src={fileUrl(user.avatarUrl)} alt={user.fullName || user.username} />
                    ) : (
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                        {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-slate-300 font-medium">
                    {user?.fullName || user?.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-4 bg-slate-800 border-slate-700 text-slate-200">
                <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700"/>
                
                <Link to="/profile">
                  <DropdownMenuItem className="focus:bg-slate-700 focus:text-white cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil Ayarları</span>
                  </DropdownMenuItem>
                </Link>

                <a href="mailto:flow.boardd@gmail.com">
                    <DropdownMenuItem className="focus:bg-slate-700 focus:text-white cursor-pointer">
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Destek</span>
                    </DropdownMenuItem>
                </a>
                
                <DropdownMenuSeparator className="bg-slate-700"/>
                <DropdownMenuItem onSelect={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>
      
      <BottomNav />
      
    </>
  );
}

export default Header;
