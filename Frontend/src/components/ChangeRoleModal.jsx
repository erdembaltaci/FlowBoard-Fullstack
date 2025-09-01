import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

// Diğer modallarla tutarlılık için aynı stil objesini kullanıyoruz
const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#1e293b', // bg-slate-800
    border: '1px solid #334155', // border-slate-700
    borderRadius: '0.5rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '420px', // Biraz daha dar ve şık
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50
  },
};

Modal.setAppElement('#root');

function ChangeRoleModal({ isOpen, onRequestClose, onSave, userToEdit }) {
    // Seçilen rolü state'te tutuyoruz
    const [newRole, setNewRole] = useState('');

    // Modal açıldığında veya düzenlenecek kullanıcı değiştiğinde,
    // state'i kullanıcının mevcut rolüyle güncelliyoruz.
    useEffect(() => {
        if (userToEdit) {
            setNewRole(userToEdit.role || '');
        }
    }, [userToEdit, isOpen]);

    const handleSave = () => {
        if (!newRole) {
            toast.warn("Lütfen bir rol seçin.");
            return;
        }
        if (userToEdit) {
            onSave(userToEdit.id, { newRole: newRole });
        }
    };

    // Düzenlenecek kullanıcı yoksa modal'ı render etme
    if (!userToEdit) return null;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={modalStyles}
            contentLabel="Rol Değiştirme Formu"
            closeTimeoutMS={300} // Kapanma animasyonu için süre
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <h2 className="text-2xl font-semibold mb-2 text-white">Rol Değiştir</h2>
                <p className="text-slate-400 mb-6">
                    <span className="font-bold text-slate-200">{userToEdit.fullName}</span> kullanıcısının rolünü güncelleyin.
                </p>
                <div className="mb-4">
                    <Select onValueChange={setNewRole} value={newRole}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Bir rol seçin..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                            <SelectItem value="BusinessUser" className="focus:bg-slate-100 focus:text-slate-900">Business User</SelectItem>
                            <SelectItem value="Developer" className="focus:bg-slate-100 focus:text-slate-900">Developer</SelectItem>
                            <SelectItem value="TeamLead" className="focus:bg-slate-100 focus:text-slate-900">Team Lead</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-end gap-3 mt-8">
                    <Button type="button" variant="ghost" onClick={onRequestClose} className="text-slate-300 hover:text-white hover:bg-slate-700">
                        İptal
                    </Button>
                    <Button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            </motion.div>
        </Modal>
    );
}

export default ChangeRoleModal;