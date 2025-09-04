import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, File as FileIcon } from 'lucide-react';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fileUrl } from "../lib/fileUrl";

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }};

function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userService.getMyProfile();
                setProfile(res.data);
                if (res.data.avatarUrl) {
                    setPreviewUrl(fileUrl(res.data.avatarUrl));
                }
            } catch {
                toast.error("Profil bilgileri yüklenemedi.");
            }
        };
        fetchProfile();
    }, []);
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file)); // geçici preview
        }
    };
    
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setIsProfileLoading(true);
        try {
            await userService.updateMyProfile({ 
                firstName: profile.firstName, 
                lastName: profile.lastName,
                email: profile.email,
                username: profile.username,
                profilePicture: profilePicture
            });
            toast.success("Profil başarıyla güncellendi.");
            await refreshUser();
        } catch (error) {
            toast.error(error.response?.data?.error || "Profil güncellenemedi.");
        } finally {
            setIsProfileLoading(false);
        }
    };
    
    const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        try {
            await userService.changeMyPassword(passwordData);
            toast.success("Şifre başarıyla değiştirildi.");
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || "Şifre değiştirilemedi.");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if (!profile) return <div className="p-8 text-center text-slate-400">Profil Yükleniyor...</div>;

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Link to="/workspace" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mb-2">
                    <ArrowLeft size={16} /> Çalışma Alanına Dön
                </Link>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Profilim ve Ayarlar</h1>
                <p className="text-lg text-slate-400 mt-2">Kişisel bilgilerinizi ve fotoğrafınızı güncelleyin.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol Taraf: Avatar Kartı */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-1">
                    <Card className="bg-slate-800/50 border-slate-700 p-6 flex flex-col items-center h-full">
                        <CardHeader className="p-0 flex flex-col items-center text-center">
                             <div className="relative w-32 h-32 mx-auto group">
                                <Avatar className="w-32 h-32 text-4xl border-2 border-slate-600">
                                    {previewUrl ? (
                                        <AvatarImage src={previewUrl} alt={profile.firstName} />
                                    ) : profile.avatarUrl ? (
                                        <AvatarImage src={fileUrl(profile.avatarUrl)} alt={profile.firstName} />
                                    ) : (
                                        <AvatarFallback className="bg-slate-700">
                                            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div 
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" 
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl mt-4 text-white">{profile.firstName} {profile.lastName}</CardTitle>
                            <CardDescription className="text-slate-400">{profile.email}</CardDescription>
                            
                            <div className="w-full mt-6">
                                 <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" />
                                 <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
                                >
                                    <FileIcon size={16} className="mr-2" />
                                    {profile.avatarUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Seç'}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Sağ Taraf: Diğer Kartlar */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                        <Card className="bg-slate-800/50 border-slate-700">
                           <CardHeader><CardTitle className="text-slate-100">Profil Bilgilerini Düzenle</CardTitle></CardHeader>
                           <CardContent>
                               <form onSubmit={handleProfileSave} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label className="text-slate-400" htmlFor="firstName">Ad</Label><Input id="firstName" name="firstName" value={profile.firstName || ''} onChange={handleProfileChange} className="bg-slate-700 border-slate-600 text-white" /></div>
                                        <div className="space-y-2"><Label className="text-slate-400" htmlFor="lastName">Soyad</Label><Input id="lastName" name="lastName" value={profile.lastName || ''} onChange={handleProfileChange} className="bg-slate-700 border-slate-600 text-white" /></div>
                                    </div>
                                    <div className="space-y-2"><Label className="text-slate-400" htmlFor="username">Kullanıcı Adı</Label><Input id="username" name="username" value={profile.username || ''} onChange={handleProfileChange} className="bg-slate-700 border-slate-600 text-white" /></div>
                                    <div className="space-y-2"><Label className="text-slate-400" htmlFor="email">Email</Label><Input id="email" name="email" value={profile.email || ''} onChange={handleProfileChange} className="bg-slate-700 border-slate-600 text-white" /></div>

                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white" disabled={isProfileLoading}>{isProfileLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</Button>
                               </form>
                           </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                       <Card className="bg-slate-800/50 border-slate-700">
                           <CardHeader><CardTitle className="text-slate-100">Şifre Değiştir</CardTitle></CardHeader>
                           <CardContent>
                               <form onSubmit={handlePasswordSave} className="space-y-4">
                                    <div className="space-y-2"><Label className="text-slate-400" htmlFor="currentPassword">Mevcut Şifre</Label><Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} className="bg-slate-700 border-slate-600 text-white" /></div>
                                    <div className="space-y-2"><Label className="text-slate-400" htmlFor="newPassword">Yeni Şifre</Label><Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} className="bg-slate-700 border-slate-600 text-white" /></div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white" disabled={isPasswordLoading}>{isPasswordLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}</Button>
                               </form>
                           </CardContent>
                       </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
