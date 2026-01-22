"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Lock, Save } from "lucide-react";

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form inputs
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

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

    if (!user) return <div className="p-8">Carregando perfil...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
                <p className="text-muted-foreground">Gerencie suas credenciais de acesso.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Info Card */}
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
                        <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                            Para alterar o nome ou email, contate o suporte técnico ou edite diretamente no banco de dados.
                        </div>
                    </CardContent>
                </Card>

                {/* Password Change Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Alterar Senha
                        </CardTitle>
                        <CardDescription>Defina uma nova senha para sua conta.</CardDescription>
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
        </div>
    );
}
