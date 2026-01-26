"use client";

import { useEffect, useState } from "react";
import { useInventoryStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AuditPage() {
    const { logs, fetchData, products } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line

    // Helper to get product name
    const getProductName = (productId?: string) => {
        if (!productId) return "N/A";
        const prod = products.find(p => p.id === productId);
        return prod ? prod.title : "Produto Deletado/Desconhecido";
    };

    const filteredLogs = logs.filter(log =>
        log.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProductName(log.productId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Auditoria & Logs</h2>
                    <p className="text-muted-foreground">Histórico completo de atividades do sistema.</p>
                </div>
                <div className="bg-white p-2 rounded-md shadow-sm border w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar logs..."
                            className="pl-9 w-full md:w-[300px] border-0 focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Registro de Movimentações
                    </CardTitle>
                    <CardDescription>Mostrando {filteredLogs.length} registros</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Funcionário/Responsável</TableHead>
                                    <TableHead>ID Transação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Nenhum registro encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(log.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        log.action === "CREATED" ? "outline" :
                                                            log.action === "ASSIGNED" ? "default" :
                                                                log.action === "RETURNED" ? "secondary" :
                                                                    log.action === "DELETED" ? "destructive" :
                                                                        "destructive"
                                                    }
                                                >
                                                    {log.action === "CREATED" && "Criação"}
                                                    {log.action === "ASSIGNED" && "Atribuição"}
                                                    {log.action === "RETURNED" && "Devolução"}
                                                    {log.action === "CONSUMED" && "Consumo"}
                                                    {log.action === "DELETED" && "Excluído"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getProductName(log.productId)}</TableCell>
                                            <TableCell>{log.employeeName || log.adminName || "-"}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {log.transactionId ? log.transactionId.slice(0, 8) + "..." : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
