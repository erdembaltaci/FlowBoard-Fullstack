// src/pages/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(email);
            toast.success(response.data.message);
        } catch (error) {
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative">
            {/* Geri butonu */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6"
            >
                <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    <Link to="/login" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /> 
                        <span className="text-sm sm:text-base">Giriş Sayfasına Dön</span>
                    </Link>
                </Button>
            </motion.div>

            {/* Form Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }} 
                className="w-full flex justify-center"
            >
                <Card className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-lg rounded-2xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100">
                            Şifreni mi Unuttun?
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm sm:text-base">
                            Sorun değil. E-posta adresinizi girin, size sıfırlama linki gönderelim.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-400 text-sm sm:text-base">
                                    Email
                                </Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="ornek@sirket.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full !mt-6 bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-md md:text-lg py-2 sm:py-3 rounded-xl" 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default ForgotPasswordPage;
