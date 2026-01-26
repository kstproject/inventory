"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, ClipboardCheck } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0f172a] font-sans selection:bg-blue-500/30">
            {/* Nav */}
            <nav className="fixed w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo-white.png"
                            alt="Grupo Baptista Leal"
                            width={220}
                            height={60}
                            priority
                            className="h-12 w-auto object-contain"
                        />
                    </div>

                    <Link href="/login">
                        <Button className="bg-white hover:bg-slate-200 text-[#0f172a] rounded-full px-8 shadow-md transition-all hover:shadow-lg font-semibold">
                            Acessar Painel
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0f172a] to-[#0f172a]">
                <div className="container mx-auto px-6 flex flex-col items-center text-center max-w-4xl">
                    <div className="space-y-10 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm shadow-sm border border-slate-700 text-blue-200 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Sistema de Gestão Patrimonial
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
                            Controle de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-white">Ativos Operacionais</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200">
                            Centralize a gestão de equipamentos, contratos e termos de responsabilidade em uma única plataforma segura.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both delay-300">
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button size="lg" className="h-14 px-8 w-full sm:w-auto text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all">
                                    Entrar no Sistema <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/return" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="h-14 px-8 w-full sm:w-auto text-lg bg-transparent border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl">
                                    Portal de Devolução
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-[#0f172a] border-t border-slate-800/60">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-4 text-center">
                    <div className="text-slate-600 text-sm">
                        &copy; {new Date().getFullYear()} Grupo Baptista Leal. Uso interno.
                    </div>
                </div>
            </footer>
        </div>
    );
}
