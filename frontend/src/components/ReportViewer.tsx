import ReactMarkdown from 'react-markdown';
import { FileText, Printer, Copy, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportViewerProps {
    report: string;
    sources?: string[];
}

export function ReportViewer({ report, sources }: ReportViewerProps) {
    const handleDownload = () => {
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'research-report.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl overflow-hidden"
        >
            <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center px-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-cyan-50">
                    <FileText className="text-cyan-400 w-5 h-5" />
                    Research Report
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Download Markdown"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigator.clipboard.writeText(report)}
                        className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Copy to Clipboard"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Print / Save as PDF"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-8 prose prose-invert prose-cyan max-w-none prose-headings:font-semibold prose-a:text-cyan-400">
                <ReactMarkdown>{report}</ReactMarkdown>

                {/* Sources Section */}
                {sources && sources.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-cyan-500" />
                            Sources
                        </h3>
                        <div className="grid gap-2 text-sm">
                            {sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-cyan-400 truncate block transition-colors bg-white/5 p-2 rounded border border-white/5 hover:border-cyan-500/30"
                                >
                                    {source}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
