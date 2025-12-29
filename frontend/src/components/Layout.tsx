import type { ReactNode } from 'react';
import { Brain } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
    isOpen: boolean; // Just to adjust padding if needed, though sidebar is fixed
}

export function Layout({ children, sidebar }: LayoutProps) {
    return (
        <div className="min-h-screen font-sans flex relative overflow-hidden">
            {sidebar}

            <main className="flex-1 w-full pl-0 md:pl-20 transition-all duration-300"> {/* Added placeholder padding for sidebar breathing room */}
                <div className="max-w-5xl mx-auto p-8 flex flex-col items-center min-h-screen">

                    {/* Header */}
                    <header className="mb-16 mt-8 text-center relative z-10 w-full">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-30 animate-pulse-glow rounded-full"></div>
                                <Brain className="w-16 h-16 text-cyan-400 relative z-10" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent tracking-tight pb-2">
                                    Deep Research Agent
                                </h1>
                                <p className="text-slate-400 text-lg font-light tracking-wide">
                                    Autonomous Intelligence & Analysis Engine
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="w-full space-y-12 relative z-10">
                        {children}
                    </div>

                    <div className="h-20"></div> {/* Spacer */}
                </div>
            </main>
        </div>
    );
}
