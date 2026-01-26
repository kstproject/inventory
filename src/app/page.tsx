"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, ClipboardCheck, BarChart3 } from "lucide-react";

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

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-[#1e3a8a] transition-colors">Funcionalidades</a>
                        <a href="#about" className="hover:text-[#1e3a8a] transition-colors">Sobre</a>
                    </div>

                    <Link href="/login">
                        <Button className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white rounded-full px-8 shadow-md">
                            Acessar Painel
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f8fafc] -z-10 skew-x-[-12deg] translate-x-20"></div>

                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1e3a8a] text-sm font-semibold border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Sistema de Gestão Patrimonial
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                            Controle total dos <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-[#b49b67]">Ativos Operacionais</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                            Gerencie equipamentos, ferramentas e contratos com responsabilidade e eficiência tecnológica. Do canteiro de obras ao escritório.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/login">
                                <Button size="lg" className="h-16 px-10 text-lg bg-[#b49b67] hover:bg-[#9a8455] text-white rounded-xl shadow-xl transition-all hover:-translate-y-1">
                                    Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="h-16 px-10 text-lg border-2 rounded-xl">
                                Ver Demonstração
                            </Button>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in zoom-in duration-1000">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#1e3a8a]/20 to-[#b49b67]/20 rounded-[2rem] blur-2xl"></div>
                        <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl border border-gray-100">
                            <Image
                                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
                                alt="Dashboard Preview"
                                width={1200}
                                height={800}
                                className="rounded-[1.8rem] object-cover"
                            />
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-4 animate-bounce">
                            <div className="bg-green-100 p-2 rounded-full">
                                <ClipboardCheck className="text-green-600 h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">Termos Assinados</div>
                                <div className="text-xs text-gray-500">100% Digital</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Stats */}
            <section id="features" className="py-20 bg-[#1e3a8a]">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="text-4xl font-bold text-white tracking-tight">Inventário</div>
                            <p className="text-blue-100/70">Acompanhamento em tempo real de cada item em estoque ou atribuído.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-4xl font-bold text-white tracking-tight">Jurídico</div>
                            <p className="text-blue-100/70">Termos de responsabilidade com validade digital e rastreabilidade total.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="text-4xl font-bold text-white tracking-tight">Agilidade</div>
                            <p className="text-blue-100/70">Fluxos de entrega e devolução simplificados via QR Code e PWA.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-12 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-[#1e3a8a] h-6 w-6" />
                        <span className="font-bold text-gray-900">Inventory Pro <span className="text-[#b49b67]">Baptista Leal</span></span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Grupo Baptista Leal. Tecnologia a serviço da construção.
                    </div>
                </div>
            </footer>
        </div>
    );
}
