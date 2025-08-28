// src/components/AddMemberModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';

// Modal için koyu tema stilleri
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
    maxWidth: '500px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50
  },
};

Modal.setAppElement("#root"); 

function AddMemberModal({ isOpen, onRequestClose, onSave, teamId, existingMembers = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // Modal her açıldığında state'i sıfırla
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSearchResults([]);
            setSelectedUser(null);
        }
    }, [isOpen]);

    // Kullanıcı arama fonksiyonu
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }
        const search = async () => {
            try {
                const response = await userService.searchUsers(searchTerm);
                const existingMemberIds = new Set(existingMembers.map(member => member.id));
                const filteredResults = response.data.filter(user => !existingMemberIds.has(user.id));
                setSearchResults(filteredResults);
            } catch (error) {
                toast.error("Kullanıcılar aranırken bir hata oluştu.");
            }
        };
        const debounce = setTimeout(() => search(), 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, existingMembers]);

    const handleSaveClick = () => {
        if (!selectedUser) {
            toast.warn("Lütfen bir üye seçin.");
            return;
        }
        onSave(teamId, { userId: selectedUser.id });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={modalStyles}
            contentLabel="Üye Ekle"
        >
            <h2 className="text-2xl font-semibold mb-4 text-white">Takıma Üye Ekle</h2>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="search-member" className="text-slate-400">Kullanıcı Ara (Ad veya Email)</Label>
                    <Input 
                        id="search-member"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSelectedUser(null);
                        }}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        placeholder="Aramak için en az 2 karakter girin..."
                        autoComplete="off"
                    />
                </div>
                
                {searchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-700 p-2 rounded-md">
                        {searchResults.map(user => {
                            // Görüntülenecek ana ismi belirliyoruz: fullName varsa ve boş değilse o, yoksa email.
                            const displayName = user.fullName?.trim() || user.email;
                            // Eğer displayName olarak fullName gösteriliyorsa, alt bilgi olarak e-postayı göster.
                            const subtext = user.fullName?.trim() ? user.email : '';

                            return (
                                <div 
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        // Input'a da ana ismi (fullName veya email) yazıyoruz.
                                        setSearchTerm(displayName); 
                                        setSearchResults([]);
                                    }}
                                    className={`p-2 rounded-md cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
                                >
                                    <p className="font-semibold text-slate-100">{displayName}</p>
                                    {/* Sadece subtext doluysa (yani fullName varsa) bu satırı render et */}
                                    {subtext && <p className="text-sm text-slate-400">{subtext}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onRequestClose} className="text-slate-300 hover:text-white hover:bg-slate-700">
                        İptal
                    </Button>
                    <Button onClick={handleSaveClick} className="bg-blue-600 hover:bg-blue-500">Ekle</Button>
                </div>
            </div>
        </Modal>
    );
}

export default AddMemberModal;