"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    ShieldCheck,
    Mail,
    Key,
    Trash2,
    Plus,
    Upload,
    FileText,
    CheckCircle,
    Lock,
    Save,
    FolderPlus,
    Check,
    Loader2
} from "lucide-react";
import { createAdminUser } from "@/app/actions";
import { useInventoryStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { categories, fetchCategories, addCategory } = useInventoryStore();

    // Form inputs
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [newCategory, setNewCategory] = useState("");

    // Admin creation inputs
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
        fetchCategories();
    }, [fetchCategories]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            toast.error("Por favor, digite a nova senha.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            // Check if user still has session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Sua sessão expirou. Por favor, faça login novamente.");
                window.location.href = "/login";
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!");
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao atualizar senha.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        await addCategory(newCategory.trim());
        setNewCategory("");
    };



    if (!user) return <div className="p-8">Carregando configurações...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">Gerencie perfil, categorias e importações.</p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="account">Minha Conta</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                {/* ACCOUNT TAB */}
                <TabsContent value="account">
                    <div className="grid gap-6 md:grid-cols-2 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Dados do Usuário
                                </CardTitle>
                                <CardDescription>Informações da conta atual.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input value={user.user_metadata?.name || "Não informado"} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={user.email} disabled />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Alterar Senha
                                </CardTitle>
                                <CardDescription>Defina uma nova senha.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nova Senha</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirmar Senha</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading || !password}>
                                        {loading ? "Salvando..." : "Atualizar Senha"}
                                        <Save className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* CATEGORIES TAB */}
                <TabsContent value="categories">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderPlus className="h-5 w-5" />
                                Gerenciar Categorias
                            </CardTitle>
                            <CardDescription>Adicione novas categorias de produtos ao sistema.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>Nova Categoria</Label>
                                    <Input
                                        placeholder="Ex: Veículos Pesados"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                                    Adicionar
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                {categories.map((cat, idx) => (
                                    <div key={idx} className="bg-muted p-2 rounded-md text-sm flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>



                {/* ADMIN TAB */}
                <TabsContent value="admin">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Criar Novo Administrador
                            </CardTitle>
                            <CardDescription>Cadastre novos usuários com acesso ao sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-md mb-6">
                                <strong>Nota:</strong> O novo administrador será criado imediatamente.
                                Você deve fornecer as credenciais (email e senha) para o usuário acessar o sistema.
                            </div>

                            <form className="space-y-4" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const email = formData.get('email') as string;

                                if (!email || !newAdminPassword) {
                                    toast.error("Preencha email e senha.");
                                    return;
                                }

                                if (newAdminPassword !== newAdminConfirmPassword) {
                                    toast.error("As senhas do novo admin não coincidem.");
                                    return;
                                }

                                if (newAdminPassword.length < 6) {
                                    toast.error("A senha deve ter pelo menos 6 caracteres.");
                                    return;
                                }

                                toast.promise(createAdminUser(email, newAdminPassword), {
                                    loading: 'Criando administrador...',
                                    success: (res) => {
                                        if (res.success) {
                                            // Reset form
                                            setNewAdminPassword("");
                                            setNewAdminConfirmPassword("");
                                            (e.target as HTMLFormElement).reset();
                                            return res.message;
                                        } else {
                                            throw new Error(res.message);
                                        }
                                    },
                                    error: (err) => err.message || 'Erro ao conectar com o servidor.'
                                });
                            }}>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email">E-mail do Novo Admin</Label>
                                    <Input id="admin-email" name="email" type="email" placeholder="admin@baptistaleal.com.br" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-password">Senha Provisória</Label>
                                        <Input
                                            id="admin-password"
                                            type="password"
                                            value={newAdminPassword}
                                            onChange={(e) => setNewAdminPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-confirm-password">Confirmar Senha</Label>
                                        <Input
                                            id="admin-confirm-password"
                                            type="password"
                                            value={newAdminConfirmPassword}
                                            onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="bg-[#1e3a8a]">
                                    Criar Administrador
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
