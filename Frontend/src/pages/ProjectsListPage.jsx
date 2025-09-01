import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import ProjectModal from '../components/ProjectModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Plus, FolderKanban, Users, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

function ProjectsListPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await projectService.getProjectsForUser();
            setProjects(response.data);
        } catch (err) {
            toast.error('Projeler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);
    
    const openCreateModal = () => {
        setProjectToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
    };

    const openDeleteModal = (project) => {
        setProjectToDelete(project);
        setIsConfirmModalOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await projectService.deleteProject(projectToDelete.id);
            toast.success("Proje başarıyla silindi.");
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.error || "Proje silinemedi.");
        } finally {
            setIsConfirmModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setProjectToEdit(null);
    };
    
    const handleSaveProject = async (projectData) => {
        const isEditMode = projectData.id != null;
        try {
            if (isEditMode) {
                await projectService.updateProject(projectData.id, projectData);
                toast.success("Proje başarıyla güncellendi.");
            } else {
                await projectService.createProject(projectData);
                toast.success("Proje başarıyla oluşturuldu.");
            }
            closeModal();
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.error || (isEditMode ? "Proje güncellenemedi." : "Proje oluşturulamadı."));
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Projeler Yükleniyor...</div>;

    return (
        <motion.div 
            className="space-y-8 text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <ProjectModal 
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                onSave={handleSaveProject}
                projectToEdit={projectToEdit}
            />
            <ConfirmationDialog
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteProject}
                title="Projeyi Sil"
                description={`'${projectToDelete?.name}' projesini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
            />
            <motion.header 
                className="flex flex-col md:flex-row justify-between md:items-center gap-4"
                variants={itemVariants}
            >
                <div>
                    <Link to="/workspace" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mb-2">
                        <ArrowLeft size={16} />
                        Çalışma Alanına Geri Dön
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight">Projeler</h1>
                </div>
                {user && user.role === 'TeamLead' && (
                    <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                        <Plus size={16} className="mr-2" /> Yeni Proje Oluştur
                    </Button>
                )}
            </motion.header>

            {projects.length > 0 ? (
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    {projects.map(project => {
                        const statusText = project.status === 'Active' ? 'Devam Ediyor' : (project.status === 'Completed' ? 'Tamamlandı' : 'İptal Edildi');
                        const statusBadgeClass = project.status === 'Active' ? "bg-green-500/20 text-green-400" : (project.status === 'Completed' ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400");
                        
                        return (
                            <motion.div key={project.id} variants={itemVariants} className="relative group">
                                {user && user.role === 'TeamLead' && (
                                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-800/70 hover:bg-slate-700">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200">
                                                <DropdownMenuItem onSelect={() => openEditModal(project)} className="cursor-pointer focus:bg-slate-700">
                                                    <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => openDeleteModal(project)} className="text-red-400 cursor-pointer focus:bg-red-500/20 focus:text-red-300">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                                <Link to={`/project/${project.id}/issues`} className="h-full block">
                                    <Card className="h-full flex flex-col bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-xl text-slate-100 pr-8">{project.name}</CardTitle>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadgeClass}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <CardDescription className="flex items-center gap-2 pt-2 text-slate-400">
                                                <Users className="h-4 w-4" /> {project.team.name}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-slate-400 text-sm line-clamp-3">{project.description || "Açıklama yok."}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                <motion.div 
                    className="text-center py-20 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg"
                    variants={itemVariants}
                >
                    <div className="flex justify-center mb-4">
                        <FolderKanban className="h-16 w-16 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200">Henüz Bir Projeniz Yok</h3>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                        {user.role === 'TeamLead' 
                            ? "Yukarıdaki 'Yeni Proje Oluştur' butonuyla ekibiniz için bir proje başlatın." 
                            : "Henüz bir projeye dahil edilmediniz."
                        }
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}

export default ProjectsListPage;