import { Search, Loader2, Sparkles, ArrowRight, Zap, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ResearchInputProps {
    topic: string;
    setTopic: (t: string) => void;
    onSearch: () => void;
    isLoading: boolean;
    mode: 'deep' | 'quick';
    setMode: (m: 'deep' | 'quick') => void;
}

const SUGGESTIONS = [
    "Future of solid state batteries",
    "Impact of AI on healthcare 2030",
    "Top trending innovative startups",
    "History of quantum computing"
];

export function ResearchInput({ topic, setTopic, onSearch, isLoading, mode, setMode }: ResearchInputProps) {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-4">
                <div className="bg-white/5 p-1 rounded-lg border border-white/5 flex gap-1">
                    <button
                        onClick={() => setMode('deep')}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'deep'
                                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Layers size={14} />
                        Deep Analysis
                    </button>
                    <button
                        onClick={() => setMode('quick')}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                            mode === 'quick'
                                ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Zap size={14} />
                        Quick Answer
                    </button>
                </div>
            </div>

            {/* Search Box */}
            <div className="relative group">
                <div className={clsx(
                    "absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 bg-gradient-to-r",
                    mode === 'deep' ? "from-cyan-600 to-violet-600" : "from-amber-500 to-orange-600"
                )}></div>
                <div className="relative flex items-center bg-[#0B0F19] rounded-xl p-2 border border-white/10 shadow-2xl">
                    <Search className="ml-4 w-6 h-6 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && topic && onSearch()}
                        placeholder={mode === 'deep' ? "Research a complex topic..." : "Ask a quick question..."}
                        className="w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-white placeholder-slate-600 outline-none"
                        autoFocus
                    />
                    <button
                        onClick={onSearch}
                        disabled={isLoading || !topic}
                        className={clsx(
                            "text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg",
                            mode === 'deep'
                                ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-500/20"
                                : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/20"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            <>
                                <span>Start</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Suggestions */}
            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-2"
                >
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setTopic(s);
                            }}
                            className="px-4 py-1.5 rounded-full text-sm bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 transition-all flex items-center gap-2"
                        >
                            <Sparkles className="w-3 h-3" />
                            {s}
                        </button>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
