import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Menu, User, X, LifeBuoy } from 'lucide-react'; // LifeBuoy ikonu eklendi
import { motion } from 'framer-motion';
import { fileUrl } from "../../lib/fileUrl";

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const navLinkStyles = ({ isActive }) => 
        `transition-colors duration-200 ${isActive ? "text-white font-semibold" : "text-slate-400 hover:text-white"}`;

    if (!user) return null;

    return (
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center p-4 text-white">
                {/* Sol Taraf: Logo ve Masaüstü Navigasyon */}
                <div className="flex items-center gap-8">
                    <Link to="/workspace" className="flex items-center gap-2 text-xl font-bold">
                        <LayoutDashboard className="text-blue-400" />
                        <span>FlowBoard</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <NavLink to="/projects" className={navLinkStyles}>Projeler</NavLink>
                        <NavLink to="/teams" className={navLinkStyles}>Takımlar</NavLink>
                    </nav>
                </div>

                {/* Sağ Taraf: Kullanıcı Menüsü ve Mobil Hamburger Butonu */}
                <div className="flex items-center gap-4">
                    
                    {/* 👇 YENİ EKLENEN DESTEK LİNKİ 👇 */}
                    <a href="mailto:flow.boardd@gmail.com" className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <LifeBuoy className="h-4 w-4" />
                        Destek
                    </a>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 rounded-full p-1 transition-all">
                                <Avatar className="h-8 w-8">
                                    {user && user.avatarUrl ? (
                                        <AvatarImage src={fileUrl(member.avatarUrl)} alt={member.fullName} />
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

                            <DropdownMenuSeparator className="bg-slate-700"/>
                            <DropdownMenuItem onSelect={handleLogout} className="text-red-400 focus:bg-red-500/20 focus:text-red-300 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Çıkış Yap</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <motion.div 
                    className="md:hidden bg-slate-900 border-t border-slate-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <nav className="flex flex-col items-start gap-1 p-4">
                        <NavLink to="/projects" className={navLinkStyles} onClick={() => setIsMobileMenuOpen(false)}>Projeler</NavLink>
                        <NavLink to="/teams" className={navLinkStyles} onClick={() => setIsMobileMenuOpen(false)}>Takımlar</NavLink>
                    </nav>
                </motion.div>
            )}
        </header>
    );
}

export default Header;
