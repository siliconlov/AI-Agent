import { History, MessageSquare, ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useState } from 'react';

interface HistoryItem {
    id: string;
    topic: string;
    status: string;
    created_at: string;
}

interface SidebarProps {
    history: HistoryItem[];
    currentId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, newTitle: string) => void;
}

export function Sidebar({ history, currentId, onSelect, onNew, onDelete, onUpdate }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEdit = (e: React.MouseEvent, item: HistoryItem) => {
        e.stopPropagation();
        setEditingId(item.id);
        setEditValue(item.topic);
    };

    const saveEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (editValue.trim() && editValue !== history.find(h => h.id === id)?.topic) {
            onUpdate(id, editValue.trim());
        }
        setEditingId(null);
    };

    const cancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        initial={{ x: -250, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -250, opacity: 0 }}
                        className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/5 z-40 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-white/5">
                            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                                <History className="w-4 h-4 text-cyan-400" />
                                History
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/5 rounded"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            <button
                                onClick={onNew}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-gradient-to-r from-cyan-900/20 to-violet-900/20 hover:from-cyan-900/40 hover:to-violet-900/40 border border-dashed border-slate-700 hover:border-cyan-500/50 transition-all group mb-4"
                            >
                                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-slate-200">New Research</span>
                            </button>

                            <div className="space-y-1">
                                {history.length === 0 && (
                                    <div className="text-xs text-slate-600 text-center py-4">No history yet</div>
                                )}
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => onSelect(item.id)}
                                        className={clsx(
                                            "w-full text-left p-3 rounded-lg text-sm transition-all flex items-start gap-3 cursor-pointer group relative",
                                            currentId === item.id
                                                ? "bg-white/10 text-white border-l-2 border-cyan-500"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        )}
                                    >
                                        <MessageSquare className={clsx("w-4 h-4 mt-0.5 shrink-0", currentId === item.id ? "text-cyan-400" : "text-slate-600")} />

                                        <div className="flex-1 min-w-0">
                                            {editingId === item.id ? (
                                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        className="w-full bg-black/50 text-white text-xs p-1 rounded border border-cyan-500/50 focus:outline-none"
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') saveEdit(e as any, item.id);
                                                            if (e.key === 'Escape') cancelEdit(e as any);
                                                        }}
                                                    />
                                                    <button onClick={e => saveEdit(e, item.id)} className="text-green-400 hover:text-green-300"><Check size={12} /></button>
                                                    <button onClick={cancelEdit} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                                                </div>
                                            ) : (
                                                <div className="truncate">
                                                    <div className="font-medium truncate pr-8">{item.topic}</div>
                                                    <div className="text-[10px] opacity-50 mt-1">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {editingId !== item.id && (
                                            <div className="absolute right-2 top-2 hidden group-hover:flex gap-1 bg-black/50 rounded backdrop-blur p-0.5">
                                                <button
                                                    onClick={(e) => startEdit(e, item)}
                                                    className="p-1 hover:text-cyan-400 text-slate-500"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    className="p-1 hover:text-red-400 text-slate-500"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 text-xs text-slate-600 text-center">
                            Agent v1.1.0
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-4 top-4 p-2 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 text-slate-400 hover:text-white z-50 hover:bg-cyan-500/20 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </>
    );
}

