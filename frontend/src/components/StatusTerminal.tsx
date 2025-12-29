import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle, Terminal } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';

// Use same JobStatus interface as App.tsx (or export it centrally later)
interface JobStatus {
    id: string;
    status: 'queued' | 'planning' | 'researching' | 'reporting' | 'completed' | 'failed';
    logs: string[];
    report?: string;
}

interface StatusTerminalProps {
    status: JobStatus;
}

const STEPS = ['planning', 'researching', 'reporting'];

export function StatusTerminal({ status }: StatusTerminalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [status.logs]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-white/10"
        >
            {/* Header */}
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-md opacity-20"></div>
                    <Terminal className="text-cyan-400 w-6 h-6 relative z-10" />
                </div>
                <span className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
                    System Status
                </span>
            </h2>

            {/* Progress Stepper */}
            <div className="mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-0"></div>
                <div className="flex justify-between relative z-10">
                    {STEPS.map((step) => {
                        const currentIndex = STEPS.indexOf(status.status === 'completed' ? 'reporting' : status.status === 'failed' ? 'reporting' : status.status); // heuristic for index
                        const stepIndex = STEPS.indexOf(step);
                        const active = stepIndex <= currentIndex || status.status === 'completed';
                        const current = status.status === step;

                        return (
                            <div key={step} className="flex flex-col items-center gap-3 bg-[var(--bg-primary)] px-2">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: current ? 1.2 : 1,
                                        borderColor: active ? 'var(--accent-cyan)' : '#334155', // slate-700
                                        backgroundColor: active ? 'rgba(6,182,212,0.1)' : '#0F1629'
                                    }}
                                    className={clsx(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-500",
                                        active ? "border-cyan-500 text-cyan-400" : "border-slate-700 text-slate-700"
                                    )}
                                >
                                    {current ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : active ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                </motion.div>
                                <div className="text-xs uppercase font-bold tracking-widest text-[#94a3b8]">
                                    {step}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Terminal View */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-lg blur opacity-30"></div>
                <div
                    ref={scrollRef}
                    className="relative bg-[#05080e] rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm border border-white/5 shadow-inner"
                >
                    {status.logs.length === 0 && (
                        <div className="text-slate-600 italic">Waiting for process initiation...</div>
                    )}
                    {status.logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-1.5 flex gap-2"
                        >
                            <span className="text-slate-600 select-none">›</span>
                            <span className={clsx(
                                "break-words",
                                log.toLowerCase().includes('error') ? "text-red-400" :
                                    log.toLowerCase().includes('completed') ? "text-green-400" :
                                        "text-cyan-100/90"
                            )}>
                                {log}
                            </span>
                        </motion.div>
                    ))}
                    {status.status !== 'completed' && status.status !== 'failed' && (
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-2 h-4 bg-cyan-500/50 mt-2"
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
