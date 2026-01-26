"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Users,
    Settings,
    Menu,
    ShieldCheck,
    ClipboardList,
    FileSignature
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
    { id: "nav-dash", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { id: "nav-audit", label: "Auditoria", href: "/dashboard/audit", icon: ClipboardList },
    { id: "nav-contracts", label: "Contratos", href: "/dashboard/contracts", icon: FileSignature },
    { id: "nav-employees", label: "Funcionários", href: "/employees", icon: Users },
    { id: "nav-settings", label: "Configurações", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname?.startsWith("/dashboard") || pathname?.startsWith("/employees") || pathname?.startsWith("/settings");

    if (!isAuthRoute) {
        return (
            <>
                {children}
                <Toaster />
            </>
        );
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            {/* Sidebar Desktop */}
            <aside className="hidden border-r border-[#1e293b] bg-[#0f172a] text-slate-100 md:block md:w-64 md:fixed md:h-full md:inset-y-0 z-30">
                <div className="flex h-14 items-center border-b border-[#1e293b] px-6 lg:h-[60px]">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold px-2">
                        <Image
                            src="/logo-white.png"
                            alt="Logo"
                            width={160}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                    </Link>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    {NAV_ITEMS.map((item) => (
                        <Link key={item.id} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn("w-full justify-start gap-3 transition-all duration-200",
                                    pathname.startsWith(item.href)
                                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </div>
                <div className="absolute bottom-4 left-0 w-full px-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={handleLogout}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Sair do Sistema
                    </Button>
                </div>
            </aside>

            {/* Mobile & Content */}
            <div className="flex flex-col md:pl-64 w-full">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px] sticky top-0 z-20">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col bg-[#0f172a] border-r border-[#1e293b] text-slate-100 p-6">
                            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 font-semibold mb-6 px-2"
                                >
                                    <Image
                                        src="/logo-white.png"
                                        alt="Grupo Baptista Leal"
                                        width={180}
                                        height={50}
                                        className="h-9 w-auto object-contain"
                                    />
                                </Link>
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white hover:bg-white/5",
                                            pathname.startsWith(item.href)
                                                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                                                : "text-slate-400"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto pb-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={handleLogout}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Sair do Sistema
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Header Title based on path */}
                        <h1 className="text-lg font-semibold md:text-xl">
                            {NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label || 'Dashboard'}
                        </h1>
                    </div>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-20 md:pb-6">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
}
