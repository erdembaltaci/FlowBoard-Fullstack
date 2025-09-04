import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AddMemberModal from '../components/AddMemberModal';
import ChangeRoleModal from '../components/ChangeRoleModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ArrowLeft, UserPlus, Search, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fileUrl } from "../lib/fileUrl";

// Animasyon varyantları
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

function TeamDetailPage() {
    const { user } = useAuth();
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
    const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState(null);

    const fetchTeamDetails = useCallback(async () => {
        try {
            const response = await teamService.getTeamById(teamId);
            setTeam(response.data);
        } catch (err) {
            toast.error("Takım detayları yüklenemedi.");
            setTeam(null);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchTeamDetails();
    }, [fetchTeamDetails]);

    const filteredMembers = useMemo(() => {
        if (!team?.members) return [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return team.members.filter(member =>
            member.fullName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            member.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
            member.email?.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [team, searchTerm]);

    const handleSaveMember = async (teamId, addUserDto) => {
        try {
            await teamService.addUserToTeam(teamId, addUserDto);
            toast.success("Üye başarıyla eklendi.");
            setIsAddMemberModalOpen(false);
            fetchTeamDetails();
        } catch (error) { toast.error(error.response?.data?.error || "Üye eklenemedi."); }
    };

    const handleRemoveMember = async () => {
        if (!userToRemove) return;
        try {
            await teamService.removeUserFromTeam(teamId, userToRemove.id);
            toast.success(`'${userToRemove.fullName?.trim() || userToRemove.email}' başarıyla takımdan çıkarıldı.`);
            fetchTeamDetails();
        } catch (error) {
            toast.error(error.response?.data?.error || "Üye çıkarılamadı.");
        } finally {
            setIsConfirmModalOpen(false);
            setUserToRemove(null);
        }
    };

    const openConfirmationModal = (member) => {
        setUserToRemove(member);
        setIsConfirmModalOpen(true);
    };

    const handleChangeRoleClick = (member) => {
        setSelectedUserForRoleChange(member);
        setIsChangeRoleModalOpen(true);
    };

    const handleRoleSave = async (userId, roleChangeDto) => {
        try {
            await userService.changeUserRole({ userId, newRole: roleChangeDto.newRole });
            toast.success("Kullanıcı rolü başarıyla güncellendi.");
            setIsChangeRoleModalOpen(false);
            fetchTeamDetails();
        } catch (error) { toast.error(error.response?.data?.error || "Rol değiştirilemedi."); }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Takım Detayları Yükleniyor...</div>;
    if (!team) return <div className="p-8 text-center text-red-400">Takım bilgileri yüklenemedi veya böyle bir takım bulunamadı.</div>;

    const isTeamLead = user && user.id === team.teamLead?.id;

    return (
        <motion.div
            className="space-y-8 text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onRequestClose={() => setIsAddMemberModalOpen(false)}
                onSave={handleSaveMember}
                teamId={parseInt(teamId)}
                existingMembers={team.members}
            />
            <ChangeRoleModal
                isOpen={isChangeRoleModalOpen}
                onRequestClose={() => setIsChangeRoleModalOpen(false)}
                onSave={handleRoleSave}
                userToEdit={selectedUserForRoleChange}
            />
            <ConfirmationDialog
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleRemoveMember}
                title="Üyeyi Takımdan Çıkar"
                description={`'${userToRemove?.fullName?.trim() || userToRemove?.email || ''}' kullanıcısını bu takımdan kalıcı olarak çıkarmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
            />

            <motion.div variants={itemVariants}>
                <Link to="/teams" className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mb-2">
                    <ArrowLeft size={16} /> Takım Listesine Geri Dön
                </Link>
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mt-1">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">{team.name}</h1>
                        <p className="text-lg text-slate-400 flex items-center gap-2 mt-2">
                            <Crown className="h-5 w-5 text-amber-400" />
                            Takım Lideri: {team.teamLead?.fullName?.trim() || team.teamLead?.email || 'Belirtilmemiş'}
                        </p>
                    </div>
                    {isTeamLead && (
                        <Button onClick={() => setIsAddMemberModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/40">
                            <UserPlus size={16} className="mr-2" /> Üye Ekle
                        </Button>
                    )}
                </header>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-slate-100">Takım Üyeleri ({filteredMembers.length})</CardTitle>
                            <CardDescription className="text-slate-400">Takımda yer alan tüm üyeler.</CardDescription>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <Input
                                placeholder="Üye ara (Ad, Kullanıcı Adı, Email)..."
                                className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-blue-500 placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <motion.ul
                            className="divide-y divide-slate-700"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredMembers.map(member => (
                                <motion.li
                                    key={member.id}
                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            {member.avatarUrl ? (
                                                <AvatarImage src={fileUrl(member.avatarUrl)} alt={member.fullName} />
                                            ) : (
                                                <AvatarFallback className="bg-slate-700">
                                                    {member.fullName?.charAt(0).toUpperCase() || member.username?.charAt(0).toUpperCase() || '?'}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-slate-100">{member.fullName || member.username}</p>
                                            <p className="text-sm text-slate-400">{member.email}</p>
                                        </div>
                                    </div>
                                    {isTeamLead && user.id !== member.id && (
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleChangeRoleClick(member)}
                                                className="border-slate-600 bg-transparent text-slate-400 hover:bg-slate-700 hover:text-white transition-all duration-200"
                                            >
                                                Rol Değiştir
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                onClick={() => openConfirmationModal(member)}
                                            >
                                                Çıkar
                                            </Button>
                                        </div>
                                    )}
                                </motion.li>
                            ))}
                        </motion.ul>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default TeamDetailPage;
