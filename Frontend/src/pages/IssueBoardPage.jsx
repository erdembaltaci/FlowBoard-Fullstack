import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { projectService } from '../services/projectService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../contexts/AuthContext';
import IssueModal from '../components/IssueModal';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { fileUrl } from "../lib/fileUrl";

// Kart stilleri
const statusStyles = {
  ToDo: { borderColor: 'border-l-blue-500', ringColor: 'ring-blue-500', shadowColor: 'shadow-blue-500/20', label: "Yapılacak" },
  InProgress: { borderColor: 'border-l-amber-500', ringColor: 'ring-amber-500', shadowColor: 'shadow-amber-500/20', label: "Geliştiriliyor" },
  InReview: { borderColor: 'border-l-purple-500', ringColor: 'ring-purple-500', shadowColor: 'shadow-purple-500/20', label: "İnceleniyor" },
  Done: { borderColor: 'border-l-green-500', ringColor: 'ring-green-500', shadowColor: 'shadow-green-500/20', label: "Tamamlandı" },
  Default: { borderColor: 'border-l-slate-500', ringColor: 'ring-slate-500', shadowColor: 'shadow-slate-500/20', label: "" },
};

function IssueBoardPage() {
    const { user } = useAuth();
    const { projectId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [issuesByStatus, setIssuesByStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);

    const members = project?.team?.members || [];
    const columnOrder = ['ToDo', 'InProgress', 'InReview', 'Done'];

    useEffect(() => {
        const assigneeId = searchParams.get('assigneeId');
        setSelectedAssigneeId(assigneeId ? parseInt(assigneeId) : null);
    }, [searchParams]);

    const fetchProjectAndIssues = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const projectResponse = await projectService.getProjectById(projectId);
            setProject(projectResponse.data);
            const filterDto = { projectId: parseInt(projectId), assigneeId: selectedAssigneeId };
            const issuesResponse = await issueService.filterIssues(filterDto);
            const grouped = columnOrder.reduce((acc, status) => ({ ...acc, [status]: [] }), {});
            (issuesResponse.data || []).forEach((issue) => {
                if (grouped[issue.status]) grouped[issue.status].push(issue);
            });
            for (const status in grouped) {
                grouped[status].sort((a, b) => a.order - b.order);
            }
            setIssuesByStatus(grouped);
        } catch (err) {
            toast.error('Proje verileri yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [projectId, selectedAssigneeId]);

    useEffect(() => {
        fetchProjectAndIssues();
    }, [fetchProjectAndIssues]);

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const startKey = source.droppableId;
        const finishKey = destination.droppableId;
        const startIssues = Array.from(issuesByStatus[startKey] || []);
        const [movedItem] = startIssues.splice(source.index, 1);
        const newIssuesByStatus = { ...issuesByStatus, [startKey]: startIssues };
        const finishIssues = startKey === finishKey ? startIssues : Array.from(issuesByStatus[finishKey] || []);
        
        finishIssues.splice(destination.index, 0, { ...movedItem, status: finishKey });
        newIssuesByStatus[finishKey] = finishIssues;
        setIssuesByStatus(newIssuesByStatus);

        issueService
            .moveIssue(parseInt(draggableId), { newStatus: destination.droppableId, newOrder: destination.index })
            .catch(() => {
                toast.error('Görev taşınamadı! Yetkiniz olmayabilir.');
                fetchProjectAndIssues();
            });
    };

    const handleSaveIssue = async (issueData) => {
        try {
            if (issueData.id) {
                await issueService.updateIssue(issueData.id, {
                    title: issueData.title,
                    description: issueData.description,
                    assigneeId: issueData.assigneeId,
                    estimatedHours: issueData.estimatedHours,
                });
                toast.success('Görev başarıyla güncellendi.');
            } else {
                await issueService.createIssue({ ...issueData, projectId: parseInt(projectId), status: 'ToDo' });
                toast.success('Görev başarıyla oluşturuldu.');
            }
            setIsModalOpen(false);
            fetchProjectAndIssues();
        } catch (error) {
            toast.error(error.response?.data?.error || 'İşlem başarısız oldu.');
        }
    };

    const openModalForNew = () => {
        setSelectedIssue(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (issue) => {
        const isReporter = issue.reporter?.id === user.id;
        const isAssignee = issue.assignee?.id === user.id;
        const isTeamLead = project?.team?.teamLead?.id === user.id;
        if (isReporter || isAssignee || isTeamLead) {
            setSelectedIssue(issue);
            setIsModalOpen(true);
        } else {
            toast.warn('Bu görevi sadece oluşturan kişi, atanan kişi veya takım lideri düzenleyebilir.');
        }
    };

    const filterByAssignee = (memberId) => {
        const currentAssigneeId = searchParams.get('assigneeId');
        if (memberId && currentAssigneeId === memberId.toString()) {
            navigate(`/project/${projectId}/board`);
        } else if (memberId) {
            navigate(`/project/${projectId}/board?assigneeId=${memberId}`);
        } else {
            navigate(`/project/${projectId}/board`);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Kanban Panosu Yükleniyor...</div>;

    return (
        <motion.div className="space-y-6 p-2 sm:p-4 md:p-6 lg:p-8" initial={{opacity: 0}} animate={{opacity: 1}}>
            <IssueModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveIssue}
                issue={selectedIssue}
                projectTeamMembers={members}
            />

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <Link to={`/project/${projectId}/issues`} className="text-sm sm:text-base text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mb-2">
                        <ArrowLeft size={16} /> Görev Listesine Geri Dön
                    </Link>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">{project?.name}</h1>
                </div>
                <Button onClick={openModalForNew} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <Plus size={16} className="mr-2" /> <span className="text-sm sm:text-base">Yeni Görev Ekle</span>
                </Button>
            </header>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex-wrap">
                <span className="font-semibold text-sm text-slate-300 shrink-0">Hızlı Filtrele:</span>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                        size="sm"
                        onClick={() => filterByAssignee(null)}
                        className={`rounded-full transition-colors ${!selectedAssigneeId ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                    >
                        Tümünü Göster
                    </Button>
                    {members.map((m) => (
                        <Button
                            key={m.id}
                            size="sm"
                            onClick={() => filterByAssignee(m.id)}
                            className={`flex items-center gap-2 rounded-full transition-colors ${selectedAssigneeId === m.id ? 'bg-slate-200 text-slate-900 hover:bg-slate-300' : 'bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <Avatar className="h-6 w-6">
                                {m.avatarUrl ? ( <AvatarImage src={fileUrl(member.avatarUrl)} alt={member.fullName} />) : (<AvatarFallback className="text-xs bg-slate-700 text-white">{m.fullName?.charAt(0).toUpperCase() || '?'}</AvatarFallback>)}
                            </Avatar>
                            <span className="text-xs sm:text-sm">{m.fullName || m.email}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Kanban */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {columnOrder.map((columnName) => {
                        const columnIssues = issuesByStatus[columnName] || [];
                        const statusStyle = statusStyles[columnName] || statusStyles.Default;

                        return (
                            <Droppable key={columnName} droppableId={columnName}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 flex flex-col max-h-[80vh] overflow-y-auto">
                                        <h3 className="font-semibold text-sm sm:text-md text-slate-200 mb-2 sm:mb-3 px-1">
                                            {statusStyle.label || columnName} <span className="text-xs sm:text-sm text-slate-500">({columnIssues.length})</span>
                                        </h3>
                                        <div className="space-y-2 sm:space-y-3">
                                            {columnIssues.map((issue, index) => (
                                                <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <Card 
                                                                className={`bg-slate-800 border-l-4 border-slate-700 hover:bg-slate-700/70 transition-colors cursor-pointer ${statusStyle.borderColor} ${snapshot.isDragging ? `shadow-lg ${statusStyle.shadowColor} ring-2 ${statusStyle.ringColor}` : ''}`} 
                                                                onClick={() => openModalForEdit(issue)}
                                                            >
                                                                <CardContent className="p-2 sm:p-3">
                                                                    <p className={`font-medium text-slate-100 mb-1 sm:mb-2 ${issue.status === 'Done' ? 'line-through' : ''} text-sm sm:text-base`}>
                                                                        {issue.title}
                                                                    </p>
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs sm:text-sm font-mono text-slate-400">ID-{issue.id}</span>
                                                                            {issue.estimatedHours > 0 && (
                                                                                <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-400" title={`Tahmini Süre: ${issue.estimatedHours} saat`}>
                                                                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                                    {issue.estimatedHours}s
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {issue.assignee ? (
                                                                            <Avatar className="h-5 w-5 sm:h-6 sm:w-6" title={`Atanan: ${issue.assignee.fullName || ''}`}>
                                                                                {issue.assignee.avatarUrl ? (
                                                                                    <AvatarImage src={`https://localhost:7233${issue.assignee.avatarUrl}`} alt={issue.assignee.fullName} />
                                                                                ) : (
                                                                                    <AvatarFallback className="text-xs bg-slate-700">{issue.assignee.fullName?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                                                                                )}
                                                                            </Avatar>
                                                                        ) : <div className="h-5 w-5 sm:h-6 sm:w-6" />}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </motion.div>
    );
}

export default IssueBoardPage;
