import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { teamService } from '../services/teamService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

const modalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', background: '#1e293b', border: '1px solid #334155',
    borderRadius: '0.5rem', padding: '2rem', width: '90%', maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 50 },
};

Modal.setAppElement('#root');

function ProjectModal({ isOpen, onRequestClose, onSave, projectToEdit }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [teamId, setTeamId] = useState('');
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = projectToEdit != null;

    useEffect(() => {
        if (isOpen) {
            const fetchTeamsForUser = async () => {
                try {
                    const response = await teamService.getTeamsForUser();
                    setTeams(response.data);
                } catch {
                    toast.error("Takımlar yüklenemedi.");
                }
            };
            fetchTeamsForUser();

            if (isEditMode) {
                setName(projectToEdit.name || '');
                setDescription(projectToEdit.description || '');
                setTeamId(projectToEdit.team?.id?.toString() || '');
            } else {
                setName('');
                setDescription('');
                setTeamId('');
            }
        }
    }, [isOpen, projectToEdit, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // DÜZELTME BURADA: Düzenleme modunda state yerine doğrudan prop'u kontrol et
        const finalTeamId = isEditMode ? projectToEdit.team?.id : teamId;

        if (!finalTeamId) {
            toast.warn("Lütfen bir takım seçin.");
            return;
        }
        
        setIsLoading(true);
        try {
            const projectData = { 
                id: projectToEdit?.id, 
                name, 
                description, 
                teamId: parseInt(finalTeamId) 
            };
            await onSave(projectData);
        } catch (error) {
            // Hata gösterimi üst bileşen tarafından yapılıyor.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles} contentLabel="Proje Formu" closeTimeoutMS={300}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                    {isEditMode ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-slate-400">Proje Adı</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                     <div>
                        <Label className="text-slate-400">Takım</Label>
                        <Select onValueChange={setTeamId} value={teamId} disabled={isEditMode}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white disabled:opacity-70 disabled:cursor-not-allowed">
                                <SelectValue placeholder="Bir takım seçin..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-slate-900">
                                {teams.map(team => (
                                    <SelectItem key={team.id} value={team.id.toString()} className="focus:bg-slate-100 cursor-pointer">{team.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isEditMode && <p className="text-xs text-slate-500 mt-1">Projenin takımı değiştirilemez.</p>}
                    </div>
                    <div>
                        <Label htmlFor="description" className="text-slate-400">Açıklama (Opsiyonel)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4">
                         <Button type="button" variant="ghost" onClick={onRequestClose} className="text-slate-300 hover:text-white hover:bg-slate-700">İptal</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isLoading}>
                            {isLoading ? (isEditMode ? 'Kaydediliyor...' : 'Oluşturuluyor...') : (isEditMode ? 'Değişiklikleri Kaydet' : 'Proje Oluştur')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    );
}

export default ProjectModal;