import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, File } from 'lucide-react';

function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
    const [profilePicture, setProfilePicture] = useState(null);
    const [fileName, setFileName] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setFileName(file.name);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.register({ ...formData, profilePicture });
            toast.success("Kayıt başarılı! Giriş yapılıyor...");
            const loginResponse = await authService.login({ email: formData.email, password: formData.password });
            login(loginResponse.data.token);
            navigate('/workspace');
        } catch (err)
        {
            const errorData = err.response?.data;
            if (errorData && errorData.errors) {
                const errorMessages = Object.values(errorData.errors).flat();
                toast.error(errorMessages.join('\n'));
            } else {
                toast.error(errorData?.error || "Kayıt başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                // DEĞİŞİKLİK BURADA: Butonun en üst katmanda olmasını sağlıyoruz.
                className="absolute top-5 left-5 z-10"
            >
                <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <Link to="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
                    </Link>
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            FlowBoard'a Katılın
                        </CardTitle>
                        <CardDescription className="text-slate-400 pt-1">
                            Verimliliğin yeni dünyasına ilk adımı atın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-slate-400">Ad</Label>
                                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-slate-400">Soyad</Label>
                                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-400">Kullanıcı Adı</Label>
                                <Input id="username" name="username" value={formData.username} onChange={handleChange} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-400">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-400">Şifre</Label>
                                <Input id="password" name="password" type="password" minLength={8} value={formData.password} onChange={handleChange} required className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500" />
                                <p className="text-xs text-slate-500 pt-1">
                                    En az 8 karakter olmalı, büyük/küçük harf ve rakam içermelidir.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profilePicture" className="text-slate-400">Profil Fotoğrafı (Opsiyonel)</Label>
                                <div className="flex items-center gap-4">
                                    <Input 
                                        id="profilePicture" 
                                        name="profilePicture" 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange} 
                                        className="hidden"
                                        accept="image/png, image/jpeg"
                                    />
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
                                    >
                                        <File size={16} className="mr-2" />
                                        Dosya Seç
                                    </Button>
                                    <span className="text-sm text-slate-500 truncate">
                                        {fileName || "Dosya seçilmedi"}
                                    </span>
                                </div>
                            </div>
                            <Button type="submit" className="w-full !mt-6 bg-blue-600 hover:bg-blue-500 text-white text-md shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/40" disabled={isLoading}>
                                {isLoading ? 'Kaydediliyor...' : 'Hesabımı Oluştur'}
                            </Button>
                        </form>
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Zaten bir hesabın var mı? <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">Giriş Yap</Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default RegisterPage;
