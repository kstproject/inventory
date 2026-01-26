"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, ClipboardCheck } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            {/* Nav */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1e3a8a] p-2 rounded-lg">
                            <ShieldCheck className="text-white h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-[#1e3a8a] leading-none tracking-tight">GRUPO</span>
                            <span className="text-lg font-bold text-[#b49b67] leading-none tracking-tight">BAPTISTA LEAL</span>
                        </div>
                    </div>

                    <Link href="/login">
                        <Button className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white rounded-full px-8 shadow-md">
                            Acessar Painel
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex items-center justify-center">
                <div className="container mx-auto px-6 flex flex-col items-center text-center max-w-4xl">
                    <div className="space-y-8 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-sm font-semibold border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Sistema de Gestão Patrimonial
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                            Controle de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-[#b49b67]">Ativos Operacionais</span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Acesse o sistema para gerenciar equipamentos e contratos.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/login">
                                <Button size="lg" className="h-14 px-10 text-lg bg-[#b49b67] hover:bg-[#9a8455] text-white rounded-xl shadow-xl transition-all hover:-translate-y-1">
                                    Entrar no Sistema <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/return">
                                <Button variant="outline" size="lg" className="h-14 px-10 text-lg bg-gray-50 border-gray-200">
                                    Portal de Devolução
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-4 text-center">
                    <div className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Grupo Baptista Leal. Uso interno.
                    </div>
                </div>
            </footer>
        </div>
    );
}
