import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Bell, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { userService } from '../services/userService';
import { toast } from 'react-toastify';

// Animasyon ve Stil objeleri
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const statusStyles = {
  ToDo: { className: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Yapılacak" },
  InProgress: { className: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Geliştiriliyor" },
};

function WorkspacePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tasksRes] = await Promise.all([
                    userService.getDashboardStats(),
                    userService.getMyOpenTasks()
                ]);
                setStats(statsRes.data);
                setMyTasks(tasksRes.data);
            } catch (error) {
                console.error("Dashboard verileri yüklenemedi:", error);
                toast.error("Kontrol paneli verileri yüklenirken bir hata oluştu.");
            } finally {
                setDashboardLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (!user) {
        return <div className="p-8 text-center bg-slate-900 text-white min-h-screen">Kullanıcı bilgisi yükleniyor...</div>;
    }

    return (
        <div className="relative min-h-screen w-full bg-slate-900 overflow-hidden">
            {/* Arka Plan Efekti */}
            <div className="absolute top-0 -left-4 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <motion.div 
                className="relative z-10 space-y-12 text-white p-4 md:p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hoş Geldin Mesajı (Eski, Sade Hali) */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Tekrar Hoş Geldin,{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            {user.fullName || user.username}!
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 mt-2">İşte çalışma alanına genel bir bakış.</p>
                </motion.div>

                {/* İstatistik Kartları */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Bana Atanan Görevler</CardTitle><ListTodo className="h-5 w-5 text-blue-400" /></CardHeader>
                        <CardContent><div className="text-4xl font-bold text-slate-50">{dashboardLoading ? '...' : stats?.assignedTasksCount}</div></CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Yaklaşan Görevler</CardTitle><Clock className="h-5 w-5 text-amber-400" /></CardHeader>
                        <CardContent><div className="text-4xl font-bold text-slate-50">{dashboardLoading ? '...' : stats?.dueSoonTasksCount}</div></CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Tamamlanan Görevlerim</CardTitle><CheckCircle2 className="h-5 w-5 text-green-400" /></CardHeader>
                        <CardContent><div className="text-4xl font-bold text-slate-50">{dashboardLoading ? '...' : stats?.completedTasksCount}</div></CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Dahil Olduğum Projeler</CardTitle><Briefcase className="h-5 w-5 text-purple-400" /></CardHeader>
                        <CardContent><div className="text-4xl font-bold text-slate-50">{dashboardLoading ? '...' : stats?.projectsCount}</div></CardContent>
                    </Card>
                </motion.div>

                {/* Görevlerim ve Son Aktiviteler Panelleri */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4 flex items-center"><ListTodo className="mr-3 h-6 w-6 text-slate-400" /> Bana Atanan Görevler</h2>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg min-h-[250px]">
                            {dashboardLoading ? (<p className="text-center p-10 text-slate-500">Görevler yükleniyor...</p>) : myTasks.length > 0 ? (
                                <ul className="divide-y divide-slate-700">
                                    {myTasks.map(task => (
                                        <li key={task.id} className="p-4 flex justify-between items-center hover:bg-slate-800 transition-colors">
                                            <div>
                                                <Link to={`/project/${task.projectId}/board`} className="font-medium text-slate-100 hover:underline">{task.title}</Link>
                                                <p className="text-sm text-slate-500">{task.projectName}</p>
                                            </div>
                                            <Badge className={statusStyles[task.status]?.className}>{statusStyles[task.status]?.label || task.status}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (<p className="text-center p-10 text-slate-500">Size atanmış aktif bir görev bulunmuyor.</p>)}
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center"><Bell className="mr-3 h-6 w-6 text-slate-400" /> Son Aktiviteler</h2>
                        <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg h-full flex flex-col justify-center items-center text-center p-8 min-h-[250px]">
                            <p className="text-lg font-semibold text-slate-300">Çok Yakında</p>
                            <p className="text-slate-500 mt-2">Projedeki en son gelişmeler burada listelenecek.</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

export default WorkspacePage;