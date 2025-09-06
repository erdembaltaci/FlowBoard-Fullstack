import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 👈 şifreyi göster/gizle state
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            login(response.data.token);

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            toast.success("Başarıyla giriş yapıldı!");
            navigate('/workspace');
        } catch (err) {
            toast.error('Geçersiz e-posta veya şifre.');
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
                className="absolute top-5 left-5"
            >
                <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <Link to="/">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
                    </Link>
                </Button>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            Tekrar Hoş Geldin!
                        </CardTitle>
                        <CardDescription className="text-slate-400 pt-1">
                            Proje yönetimine kaldığın yerden devam et.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-400">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="ornek@sirket.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2 relative">
                                <Label htmlFor="password" className="text-slate-400">Şifre</Label>
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} // 👈 şifreyi göster/gizle
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="remember-me" 
                                        checked={rememberMe}
                                        onCheckedChange={setRememberMe}
                                        className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <Label htmlFor="remember-me" className="text-sm font-medium text-slate-400 leading-none cursor-pointer">
                                        Beni Hatırla
                                    </Label>
                                </div>
                                <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
                                    Şifremi unuttum
                                </Link>
                            </div>
                            <Button type="submit" className="w-full !mt-6 bg-blue-600 hover:bg-blue-500 text-white text-md shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/40" disabled={isLoading}>
                                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                            </Button>
                        </form>
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Hesabın yok mu? <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">Ücretsiz Kayıt Ol</Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default LoginPage;
