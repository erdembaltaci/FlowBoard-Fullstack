import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const modalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', background: '#1e293b', border: '1px solid #334155',
    borderRadius: '0.5rem', padding: '2rem', width: '90%', maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 50 },
};

Modal.setAppElement('#root');

function CreateTeamModal({ isOpen, onRequestClose, onSave, teamToEdit }) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = teamToEdit != null;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(teamToEdit.name || '');
            } else {
                setName('');
            }
        }
    }, [isOpen, teamToEdit, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.warn("Lütfen bir takım adı girin.");
            return;
        }
        setIsLoading(true);
        try {
            const teamData = { id: teamToEdit?.id, name };
            await onSave(teamData);
        } catch (error) {
            // Hata üst bileşende gösteriliyor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={modalStyles}
            contentLabel={isEditMode ? "Takımı Düzenle" : "Yeni Takım Formu"}
            closeTimeoutMS={300}
        >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                <h2 className="text-2xl font-semibold mb-4 text-white">
                    {isEditMode ? 'Takım Adını Düzenle' : 'Yeni Takım Oluştur'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 space-y-2">
                        <Label htmlFor="teamName" className="text-slate-400">Takım Adı</Label>
                        <Input 
                            id="teamName" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Örn: Pazarlama Ekibi"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-8">
                        <Button type="button" variant="ghost" onClick={onRequestClose} className="text-slate-300 hover:text-white hover:bg-slate-700">İptal</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isLoading}>
                            {isLoading ? (isEditMode ? 'Kaydediliyor...' : 'Oluşturuluyor...') : (isEditMode ? 'Değişiklikleri Kaydet' : 'Oluştur')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </Modal>
    );
}

export default CreateTeamModal;