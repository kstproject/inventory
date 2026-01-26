"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Download,
    Eye,
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Upload,
    Trash2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LegacyImportModal } from "./LegacyImportModal";

export default function ContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showLegacyModal, setShowLegacyModal] = useState(false);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('signed_contracts')
                .select(`
                    *,
                    employees (name, email),
                    products (title, serial_number)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContracts(data || []);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Erro ao carregar contratos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContract = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.")) return;

        const { deleteContractAction } = await import("@/app/actions");

        // Optimistic update
        setContracts(prev => prev.filter(c => c.id !== id));
        toast.info("Excluindo contrato...");

        const result = await deleteContractAction(id);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
            fetchContracts(); // Rollback/Refresh on error
        }
    };

    const filteredContracts = contracts.filter(c =>
        c.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.products?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ContractCard = ({ contract }: { contract: any }) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border rounded-xl bg-card hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-3 rounded-full",
                    contract.type === 'DELIVERY' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                )}>
                    {contract.type === 'DELIVERY' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">{contract.employees?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                        {contract.products?.title} {contract.products?.serial_number && `(SN: ${contract.products.serial_number})`}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                    <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" /> Ver
                    </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <a href={contract.file_url} download>
                        <Download className="h-4 w-4" />
                    </a>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600"
                    onClick={() => handleDeleteContract(contract.id)}
                    title="Excluir Contrato"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <h2 className="text-3xl font-bold tracking-tight">Contratos Assinados</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar funcionário ou item..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className="bg-[#1e3a8a] gap-2" onClick={() => setShowLegacyModal(true)}>
                        <Upload className="h-4 w-4" /> Importar Legado
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="delivery">Entregues</TabsTrigger>
                    <TabsTrigger value="return">Devolvidos</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {filteredContracts.map(c => <ContractCard key={c.id} contract={c} />)}
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                    {filteredContracts.filter(c => c.type === 'DELIVERY').map(c => <ContractCard key={c.id} contract={c} />)}
                </TabsContent>

                <TabsContent value="return" className="space-y-4">
                    {filteredContracts.filter(c => c.type === 'RETURN').map(c => <ContractCard key={c.id} contract={c} />)}
                </TabsContent>
            </Tabs>

            {!loading && filteredContracts.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum contrato encontrado.</p>
                </div>
            )}

            <LegacyImportModal
                isOpen={showLegacyModal}
                onClose={() => setShowLegacyModal(false)}
                onSuccess={fetchContracts}
            />
        </div>
    );
}



function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
