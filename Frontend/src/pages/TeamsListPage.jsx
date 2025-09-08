import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateTeamModal from '../components/CreateTeamModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ArrowLeft, Plus, Users2, Crown, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fileUrl } from "../lib/fileUrl";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

function TeamsListPage() {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamToEdit, setTeamToEdit] = useState(null);
    const [teamToDelete, setTeamToDelete] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const response = await teamService.getTeamsForUser();
            setTeams(response.data);
        } catch (err) {
            toast.error("Takımlar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleSaveTeam = async (teamData) => {
        const isEditMode = teamData.id != null;
        try {
            if (isEditMode) {
                await teamService.updateTeam(teamData.id, { name: teamData.name });
                toast.success("Takım başarıyla güncellendi.");
            } else {
                await teamService.createTeam({ name: teamData.name, teamLeadId: user.id });
                toast.success("Takım başarıyla oluşturuldu.");
            }
            closeModal();
            fetchTeams();
        } catch (error) {
            toast.error(error.response?.data?.error || (isEditMode ? "Takım güncellenemedi." : "Takım oluşturulamadı."));
        }
    };

    const openCreateModal = () => {
        setTeamToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (team) => {
        setTeamToEdit(team);
        setIsModalOpen(true);
    };

    const openDeleteModal = (team) => {
        setTeamToDelete(team);
        setIsConfirmModalOpen(true);
    };

    const handleDeleteTeam = async () => {
        if (!teamToDelete) return;
        try {
            await teamService.deleteTeam(teamToDelete.id);
            toast.success("Takım başarıyla silindi.");
            fetchTeams();
        } catch (error) {
            toast.error(error.response?.data?.error || "Takım silinemedi.");
        } finally {
            setIsConfirmModalOpen(false);
            setTeamToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTeamToEdit(null);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Takımlar Yükleniyor...</div>;

    return (
        <motion.div 
            className="space-y-8 text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <CreateTeamModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                onSave={handleSaveTeam}
                teamToEdit={teamToEdit}
            />
            <ConfirmationDialog
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteTeam}
                title="Takımı Sil"
                description={`'${teamToDelete?.name}' takımını kalıcı olarak silmek istediğinizden emin misiniz? Bu takıma bağlı projeler olabilir.`}
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
                    <h1 className="text-4xl font-extrabold tracking-tight">Takımlarım</h1>
                </div>
                <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                    <Plus size={16} className="mr-2" />
                    Yeni Takım Oluştur
                </Button>
            </motion.header>
            
            {teams.length > 0 ? (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                >
                    {teams.map(team => (
                        <motion.div key={team.id} variants={itemVariants} className="relative group">
                             {user && user.id === team.teamLead?.id && (
                                // --- DEĞİŞİKLİK BURADA ---
                                // 'opacity-0 group-hover:opacity-100' sınıfları kaldırıldı.
                                <div className="absolute top-2 right-2 z-20">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-800/70 hover:bg-slate-700">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-200">
                                            <DropdownMenuItem onSelect={() => openEditModal(team)} className="cursor-pointer focus:bg-slate-700">
                                                <Edit className="mr-2 h-4 w-4" /> Düzenle
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => openDeleteModal(team)} className="text-red-400 cursor-pointer focus:bg-red-500/20 focus:text-red-300">
                                                <Trash2 className="mr-2 h-4 w-4" /> Sil
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            <Link to={`/team/${team.id}`} className="h-full block">
                                <Card className="h-full flex flex-col bg-slate-800/50 border-slate-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-slate-100 pr-8">{team.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 pt-2 text-slate-400">
                                            <Crown className="h-4 w-4 text-amber-400" />
                                            Lider: {team.teamLead?.fullName?.trim() || team.teamLead?.email || 'Belirtilmemiş'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col justify-end">
                                        <div className="mt-4">
                                            <p className="text-sm text-slate-500 mb-2">{team.members.length} üye</p>
                                            <div className="flex items-center">
                                                {team.members.slice(0, 5).map(member => (
                                                    <Avatar key={member.id} className="h-8 w-8 border-2 border-slate-900 -ml-2 first:ml-0">
                                                        {member.avatarUrl ? (
                                                            <AvatarImage src={fileUrl(member.avatarUrl)} alt={member.fullName} />
                                                        ) : (
                                                            <AvatarFallback className="bg-slate-700 text-xs">
                                                                {member.fullName?.charAt(0).toUpperCase() || "?"}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                ))}
                                                {team.members.length > 5 && (
                                                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold border-2 border-slate-900 -ml-2">
                                                        +{team.members.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    className="text-center py-20 px-6 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg"
                    variants={itemVariants}
                >
                    <div className="flex justify-center mb-4">
                        <Users2 className="h-16 w-16 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200">
                        Henüz Bir Takımınız Yok
                    </h3>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                        Yukarıdaki 'Yeni Takım Oluştur' butonuyla ilk takımınızı kurarak başlayın. Bir takım oluşturduğunuzda otomatik olarak o takımın lideri olursunuz.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}

export default TeamsListPage;
