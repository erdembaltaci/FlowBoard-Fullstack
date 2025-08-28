import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from 'framer-motion';
import { toast } from "react-toastify";

// Standart modal stilimiz
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
    maxWidth: '550px',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50
  },
};

Modal.setAppElement("#root");

function IssueModal({
  isOpen,
  onRequestClose,
  onSave,
  issue, // Düzenlenecek görev (yeni ise null)
  projectTeamMembers = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(null);
  const [estimatedHours, setEstimatedHours] = useState(null); // Tahmini süre için yeni state
  const [isLoading, setIsLoading] = useState(false);

  // Modal açıldığında veya 'issue' değiştiğinde formu doldur/sıfırla
  useEffect(() => {
    if (isOpen) {
      if (issue) { // Düzenleme modu
        setTitle(issue.title || "");
        setDescription(issue.description || "");
        setAssigneeId(issue.assignee?.id?.toString() || null);
        setEstimatedHours(issue.estimatedHours || null); // Mevcut görevin süresini al
      } else { // Yeni görev modu
        setTitle("");
        setDescription("");
        setAssigneeId(null);
        setEstimatedHours(null); // Formu sıfırla
      }
    }
  }, [issue, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave({
        ...issue,
        title,
        description,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null, // Yeni veriyi gönder
      });
    } catch (error) {
      // Hata genellikle üst bileşende gösteriliyor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={modalStyles}
      contentLabel="Görev Formu"
      closeTimeoutMS={300}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-semibold mb-4 text-white">
          {issue ? "Görevi Düzenle" : "Yeni Görev Oluştur"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-400">Başlık</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div>
            <Label htmlFor="description" className="text-slate-400">Açıklama</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label className="text-slate-400">Atanacak Kişi</Label>
                <Select onValueChange={(value) => setAssigneeId(value)} value={assigneeId || ''}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Bir üye seçin..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900">
                        <SelectItem value={null} className="focus:bg-slate-100 cursor-pointer">Atanmamış</SelectItem>
                        {projectTeamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()} className="focus:bg-slate-100 cursor-pointer">
                            {member.fullName || member.email}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-slate-400">Tahmini Süre</Label>
                <Select onValueChange={(value) => setEstimatedHours(value)} value={estimatedHours || ''}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Süre seçin (opsiyonel)..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900">
                        <SelectItem value={null} className="focus:bg-slate-100 cursor-pointer">Belirtilmemiş</SelectItem>
                        <SelectItem value="2" className="focus:bg-slate-100 cursor-pointer">2 Saat</SelectItem>
                        <SelectItem value="4" className="focus:bg-slate-100 cursor-pointer">4 Saat</SelectItem>
                        <SelectItem value="8" className="focus:bg-slate-100 cursor-pointer">8 Saat (1 Gün)</SelectItem>
                        <SelectItem value="16" className="focus:bg-slate-100 cursor-pointer">16 Saat (2 Gün)</SelectItem>
                        <SelectItem value="24" className="focus:bg-slate-100 cursor-pointer">24 Saat (3 Gün)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onRequestClose} className="text-slate-300 hover:text-white hover:bg-slate-700">
              İptal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
}

export default IssueModal;