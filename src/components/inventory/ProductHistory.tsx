"use client";

import { HistoryLog } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Circle, User, Package, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductHistoryProps {
    history: HistoryLog[];
}

export function ProductHistory({ history }: ProductHistoryProps) {
    // Sort by date desc
    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getIcon = (action: string) => {
        switch (action) {
            case 'CREATED': return Package;
            case 'ASSIGNED': return User;
            case 'RETURNED': return ArrowRightLeft;
            default: return Circle;
        }
    };

    const getColor = (action: string) => {
        switch (action) {
            case 'CREATED': return "text-blue-500 bg-blue-500/10";
            case 'ASSIGNED': return "text-orange-500 bg-orange-500/10";
            case 'RETURNED': return "text-green-500 bg-green-500/10";
            default: return "text-gray-500";
        }
    };

    const getLabel = (action: string) => {
        switch (action) {
            case 'CREATED': return "Produto Cadastrado";
            case 'ASSIGNED': return "Entregue a Funcionário";
            case 'RETURNED': return "Devolvido ao Estoque";
            default: return action;
        }
    };

    return (
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
                {sortedHistory.map((log, index) => {
                    const Icon = getIcon(log.action);
                    const colorClass = getColor(log.action);

                    return (
                        <div key={log.id} className="flex gap-4 relative">
                            {/* Connector Line */}
                            {index !== sortedHistory.length - 1 && (
                                <div className="absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-muted" />
                            )}

                            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full z-10", colorClass)}>
                                <Icon className="h-4 w-4" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {getLabel(log.action)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(log.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                                {log.employeeName && (
                                    <div className="text-sm border-l-2 pl-2 mt-1 border-muted">
                                        Responsável: <span className="font-medium text-foreground">{log.employeeName}</span>
                                        {log.protocolSignature && (
                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-green-600">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600" />
                                                Protocolo Assinado
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
