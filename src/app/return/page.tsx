"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, FileDown, Upload, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { useReactToPrint } from "react-to-print";
import { ReturnDocument } from "@/components/documents/ReturnDocument";

export default function ReturnPage() {
    const [step, setStep] = useState<'action' | 'email' | 'verification' | 'success'>('action');
    const [actionType, setActionType] = useState<'DELIVERY' | 'RETURN' | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [employee, setEmployee] = useState<any>(null);
    const [items, setItems] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    // Step 0: Select Action
    const handleActionSelect = (type: 'DELIVERY' | 'RETURN') => {
        setActionType(type);
        setStep('email');
    };

    // Step 1: Find Employee
    const handleSearch = async () => {
        if (!email) return;
        setLoading(true);
        try {
            // 1. Find Employee by Email
            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('*')
                .ilike('email', email)
                .limit(1)
                .maybeSingle();

            if (empError) {
                console.error("Error fetching employee:", empError);
                toast.error("Erro ao buscar funcionário.");
                setLoading(false);
                return;
            }

            if (!employees) {
                toast.error("Funcionário não encontrado com este e-mail.");
                setLoading(false);
                return;
            }

            setEmployee(employees);

            // 2. Find Assigned Products
            // For DELIVERY: We want to find checks recently assigned? Or just all assigned?
            // For RETURN: All assigned.
            // Simplification: Show all assigned products for both.
            const { data: products, error: prodError } = await supabase
                .from('products')
                .select('*')
                .eq('assigned_to_id', employees.id)
                .eq('status', 'ASSIGNED');

            if (prodError) {
                toast.error("Erro ao buscar itens.");
            } else {
                setItems(products || []);
                setStep('verification');
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar solicitação.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Handle Item Selection
    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Unified Step: Handle Verification (Selection + Upload)
    const handlePrepareReturn = () => {
        // Validation moved to final submit
    };

    const selectedProducts = items.filter(item => selectedItems.includes(item.id));

    // Step 3: Handle Upload
    const handleUpload = async () => {
        if (selectedItems.length === 0) {
            toast.error("Selecione pelo menos um item da lista.");
            return;
        }
        if (!file) {
            toast.error("Por favor, anexe o termo assinado.");
            return;
        }

        setLoading(true);
        try {
            // Use Server Action to bypass RLS
            const md = await import("@/app/actions");
            const uploadAction = md.uploadReturnAction;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('employeeId', employee.id);
            formData.append('items', JSON.stringify(selectedItems));
            formData.append('actionType', actionType || 'DELIVERY');

            const result = await uploadAction(formData);

            if (result.success) {
                toast.success(result.message);
                setStep('success');
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            console.error("Error in process:", error);
            toast.error(`Erro: ${error.message || "Tente novamente."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Hidden document for printing (Only needed for RETURN to generate the doc) */}
            <div className="hidden">
                {employee && selectedProducts.length > 0 && actionType === 'RETURN' && (
                    <ReturnDocument
                        ref={componentRef}
                        employee={employee}
                        items={selectedProducts}
                        date={new Date()}
                    />
                )}
            </div>

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 w-full">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/img/logobaptista.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <span className="font-semibold text-[#1e3a8a]">Inventory Pro</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card className="w-full max-w-lg shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            {(step !== 'action' && step !== 'success') && (
                                <Button variant="ghost" size="icon" onClick={() => {
                                    if (step === 'email') setStep('action');
                                    if (step === 'verification') setStep('email');
                                }}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <CardTitle>
                                {actionType === 'RETURN' ? 'Devolução de Equipamentos' : actionType === 'DELIVERY' ? 'Confirmar Recebimento' : 'Portal do Colaborador'}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {step === 'action' && "Selecione a ação desejada."}
                            {step === 'email' && "Identifique-se com seu e-mail corporativo."}
                            {step === 'verification' && `Olá, ${employee?.name}. Selecione os itens e anexe o termo assinado.`}
                            {step === 'success' && "Processo concluído com sucesso."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {step === 'action' && (
                            <div className="grid gap-4">
                                <Button
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 hover:bg-blue-50 border-2 hover:border-blue-200"
                                    onClick={() => handleActionSelect('DELIVERY')}
                                >
                                    <CheckCircle className="h-8 w-8 text-blue-600" />
                                    <div className="text-center">
                                        <div className="font-semibold">Confirmar Entrega</div>
                                        <div className="text-xs text-muted-foreground">Recebi um equipamento e quero enviar o termo assinado</div>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 hover:bg-amber-50 border-2 hover:border-amber-200"
                                    onClick={() => handleActionSelect('RETURN')}
                                >
                                    <ArrowLeft className="h-8 w-8 text-amber-600" />
                                    <div className="text-center">
                                        <div className="font-semibold">Devolver Equipamento</div>
                                        <div className="text-xs text-muted-foreground">Quero devolver um equipamento ao estoque</div>
                                    </div>
                                </Button>
                            </div>
                        )}

                        {step === 'email' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">E-mail Corporativo</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="nome@baptistaleal.com.br"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'verification' && (
                            <div className="space-y-8">
                                {/* SECTION 1: ITEMS */}
                                <div className="space-y-4">
                                    <h4 className="font-medium flex items-center gap-2 text-[#1e3a8a]">
                                        <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</div>
                                        Selecione os itens
                                    </h4>

                                    {items.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg px-4">
                                            <p className="font-medium text-gray-900">Nenhum item encontrado em sua posse.</p>
                                            <p className="text-sm mt-2">
                                                Para confirmar uma entrega, o administrador precisa primeiro <strong>Atribuir</strong> o item ao seu e-mail ({email}) no painel.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto bg-white">
                                            {items.map((item) => (
                                                <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                                                    <Checkbox
                                                        checked={selectedItems.includes(item.id)}
                                                        onCheckedChange={() => toggleItem(item.id)}
                                                        id={`item-${item.id}`}
                                                    />
                                                    <label htmlFor={`item-${item.id}`} className="flex-1 cursor-pointer">
                                                        <div className="font-medium text-sm text-gray-900">{item.title}</div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            Série: {item.serialNumber || 'N/A'} | Qtd: {item.quantity}
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: UPLOAD */}
                                <div className="space-y-4">
                                    <h4 className="font-medium flex items-center gap-2 text-[#b49b67]">
                                        <div className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</div>
                                        Anexe o termo assinado
                                    </h4>

                                    <div className="space-y-4">
                                        {actionType === 'RETURN' && (
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => handlePrint()}>
                                                <FileDown className="h-4 w-4 mr-2" />
                                                Baixar Modelo para Assinatura
                                            </Button>
                                        )}

                                        <div className="p-6 border-2 border-dashed rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {file ? file.name : "Clique para selecionar o arquivo"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {file ? "Arquivo selecionado" : "PDF ou Foto do documento assinado"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {actionType === 'RETURN' ? "Devolução Iniciada!" : "Entrega Confirmada!"}
                                </h3>
                                <p className="text-center text-muted-foreground max-w-xs mt-2">
                                    {actionType === 'RETURN'
                                        ? "Entregue os equipamentos no almoxarifado para finalizar."
                                        : "O comprovante de entrega foi salvo com sucesso."}
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter>
                        {step === 'email' && (
                            <Button className="w-full bg-[#1e3a8a]" onClick={handleSearch} disabled={loading || !email}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Consultar Itens
                            </Button>
                        )}
                        {step === 'verification' && (
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={handleUpload}
                                disabled={loading || selectedItems.length === 0 || !file}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Finalizar e Enviar
                            </Button>
                        )}
                        {step === 'success' && (
                            <Link href="/" className="w-full">
                                <Button variant="outline" className="w-full">Voltar ao Início</Button>
                            </Link>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
