// src/pages/ResetPasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (!resetToken) {
            toast.error("Geçersiz veya eksik sıfırlama linki.");
            navigate('/login');
        }
        setToken(resetToken);
    }, [searchParams, navigate]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Şifreler eşleşmiyor.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await authService.resetPassword({ token, newPassword: password, confirmPassword });
            toast.success(response.data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.error || "Şifre sıfırlanamadı.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-slate-100">Yeni Şifre Belirle</CardTitle>
                        <CardDescription className="text-slate-400 pt-1">Lütfen yeni şifrenizi girin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-slate-400">Yeni Şifre</Label>
                                <Input id="newPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="bg-slate-700 border-slate-600 text-white"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-slate-400">Yeni Şifre (Tekrar)</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-slate-700 border-slate-600 text-white"/>
                            </div>
                            <Button type="submit" className="w-full !mt-6 bg-blue-600 hover:bg-blue-500" disabled={isLoading}>
                                {isLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default ResetPasswordPage;