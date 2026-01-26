"use client";

import Link from "next/link";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/return";

    if (isPublicPage) {
        return (
            <>
                {children}
                <Toaster />
            </>
        );
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            {/* Sidebar Desktop */}
            <aside className="hidden border-r bg-background md:block md:w-64 md:fixed md:h-full md:inset-y-0 z-30">
                <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="">Inventory Pro</span>
                    </Link>
                </div>
                <div className="flex flex-col gap-2 p-4">
                    {NAV_ITEMS.map((item) => (
                        <Link key={item.id} href={item.href}>
                            <Button
                                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2",
                                    pathname.startsWith(item.href) && "bg-secondary"
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
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                                >
                                    <ShieldCheck className="h-6 w-6" />
                                    <span>Inventory Pro</span>
                                </Link>
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                            pathname.startsWith(item.href) && "bg-muted text-primary"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
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
