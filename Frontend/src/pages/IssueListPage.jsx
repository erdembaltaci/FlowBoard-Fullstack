import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { issueService } from '../services/issueService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Search, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import IssueModal from '../components/IssueModal';
import { fileUrl } from "../lib/fileUrl";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ease: "easeOut" } } };
const statusStyles = {
  ToDo: { variant: "outline", className: "border-blue-500/50 text-blue-400", label: "Yapılacak" },
  InProgress: { variant: "secondary", className: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Geliştiriliyor" },
  InReview: { variant: "secondary", className: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "İnceleniyor" },
  Done: { variant: "secondary", className: "bg-green-500/20 text-green-400 border-green-500/30", label: "Tamamlandı" },
};

function IssueListPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const members = project?.team?.members || [];

    const loadData = useCallback(async () => {
        setLoading(true); // Veri çekme başladığında yükleniyor durumunu başlat
        try {
            const [projectRes, issuesRes] = await Promise.all([
                projectService.getProjectById(projectId),
                issueService.filterIssues({ projectId: parseInt(projectId), title: searchTerm }),
            ]);
            setProject(projectRes.data);
            setIssues(issuesRes.data || []);
        } catch (err) {
            toast.error('Proje veya görevler yüklenirken hata oluştu.');
        } finally {
            setLoading(false); // İşlem bitince veya hata alınca yükleniyor durumunu bitir
        }
    }, [projectId, searchTerm]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (projectId) {
                loadData();
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [projectId, searchTerm, loadData]);

    const handleSaveIssue = async (issueData) => {
        try {
          await issueService.createIssue({ ...issueData, projectId: parseInt(projectId), status: 'ToDo' });
          toast.success('Görev başarıyla oluşturuldu.');
          setIsModalOpen(false);
          loadData(); 
        } catch (error) {
          toast.error(error.response?.data?.error || 'Görev oluşturulamadı.');
        }
    };
    
    // Sadece sayfa ilk açıldığında tam ekran yükleme göster
    if (loading && issues.length === 0) {
        return <div className="p-8 text-center text-slate-400">Görevler Yükleniyor...</div>;
    }

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
             <IssueModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveIssue}
                issue={null}
                projectTeamMembers={members}
            />
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <Link to="/projects" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mb-2"><ArrowLeft size={16} /> Proje Listesine Geri Dön</Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">{project?.name} - Görevler</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => navigate(`/project/${projectId}/board`)} variant="outline" className="text-purple-400 border-purple-400/50 hover:bg-purple-400/10 hover:text-purple-300 transition-colors">
                        Panoyu Görüntüle
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                        <Plus size={16} className="mr-2" /> Yeni Görev Ekle
                    </Button>
                </div>
            </header>

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <span className="font-semibold text-sm text-slate-300 shrink-0 mb-3 block">Üyeye Göre Pano Görüntüle:</span>
                <div className="flex items-center gap-2 flex-wrap">
                    {members.map((m) => (
                        <Button
                            key={m.id}
                            variant={'outline'}
                            size="sm"
                            onClick={() => navigate(`/project/${projectId}/board?assigneeId=${m.id}`)}
                            className="flex items-center gap-2 rounded-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            title={`${m.fullName} kullanıcısının görev panosuna git`}
                        >
                            <Avatar className="h-6 w-6"><AvatarImage src={fileUrl(user.avatarUrl)} alt={user.fullName} /><AvatarFallback>{m.fullName?.charAt(0)}</AvatarFallback></Avatar>
                            {m.fullName || m.email}
                        </Button>
                    ))}
                </div>
            </div>
            
            <Card className="bg-slate-800/50 border-slate-700 text-white">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-slate-100">Tüm Görevler</CardTitle>
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <Input 
                                placeholder="Görev başlığında ara..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="pl-10 bg-slate-800 border-slate-700 focus:ring-blue-500 placeholder:text-slate-500" 
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-700 font-semibold text-sm text-slate-400">
                        <div className="col-span-6">Görev</div>
                        <div className="col-span-3">Atanan Kişi</div>
                        <div className="col-span-3 text-right">Durum</div>
                    </div>
                    
                    {/* DÜZELTME BURADA */}
                    <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {issues.length > 0 ? (
                            <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-slate-700">
                                {issues.map(issue => (
                                    <motion.li key={issue.id} variants={itemVariants} className="grid grid-cols-12 gap-4 items-center px-4 py-3">
                                        <div className="col-span-6 flex flex-col">
                                            <span className="font-medium text-slate-100">{issue.title}</span>
                                            <span className="text-xs text-slate-500">ID-{issue.id}</span>
                                        </div>
                                        <div className="col-span-3">
                                            {issue.assignee ? (
                                                <button 
                                                    onClick={() => navigate(`/project/${projectId}/board?assigneeId=${issue.assignee.id}`)}
                                                    className="flex items-center gap-2 rounded-md p-1 -ml-1 hover:bg-slate-700 transition-colors w-full text-left"
                                                    title={`${issue.assignee.fullName} kullanıcısının panosuna git`}
                                                >
                                                    <Avatar className="h-6 w-6">
                                                        {issue.assignee.avatarUrl ? (
                                                            <AvatarImage src={`https://localhost:7233${issue.assignee.avatarUrl}`} alt={issue.assignee.fullName} />
                                                        ) : (
                                                            <AvatarFallback className="text-xs bg-slate-700">{issue.assignee.fullName?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <span className="text-sm text-slate-300 truncate">{issue.assignee.fullName}</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 p-1">
                                                    <UserCircle size={24} className="text-slate-600" />
                                                    <span className="text-sm text-slate-500">Atanmamış</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-3 flex justify-end">
                                            <Badge variant={statusStyles[issue.status]?.variant} className={statusStyles[issue.status]?.className}>
                                                {statusStyles[issue.status]?.label || issue.status}
                                            </Badge>
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        ) : (
                            <div className="text-center py-16 text-slate-500">
                                {searchTerm 
                                    ? 'Aradığınız kriterlere uygun görev bulunamadı.' 
                                    : 'Bu projede henüz görev yok.'
                                }
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default IssueListPage;
