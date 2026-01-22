"use client";

import { useRef, useState, useEffect } from "react";
import { Check, User, FileText, Send, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from "@/lib/store";
import { Product, Employee } from "@/lib/types";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { TermDocument } from "../documents/TermDocument";
import { sendTermEmail } from "@/app/actions";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AssignModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AssignModal({ product, isOpen, onClose }: AssignModalProps) {
    const { employees, assignProduct } = useInventoryStore();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [quantityToAssign, setQuantityToAssign] = useState(1);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSending, setIsSending] = useState(false);

    // Reset quantity when modal opens
    useEffect(() => {
        if (isOpen) setQuantityToAssign(1);
    }, [isOpen]);

    const componentRef = useRef<HTMLDivElement>(null);

    const [adminName, setAdminName] = useState("Admin TI");

    useEffect(() => {
        const fetchUser = async () => {
            const { supabase } = await import("@/lib/supabase");
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                // If you have metadata with name, use it. Otherwise use email.
                setAdminName(user.user_metadata?.name || user.email);
            }
        };
        fetchUser();
    }, []);

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    const generatePdfBase64 = async () => {
        if (!componentRef.current) return null;

        try {
            // Reduce scale for smaller file size (1.5 is usually sufficient for print)
            const canvas = await html2canvas(componentRef.current, { scale: 1.5 });

            // Use JPEG with 0.8 quality instead of PNG
            const imgData = canvas.toDataURL('image/jpeg', 0.80);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            // Clean base64 string
            const base64 = pdf.output('datauristring').split(',')[1];
            return base64;
        } catch (e) {
            console.error("PDF Gen Error", e);
            return null;
        }
    };

    const handleSendEmail = async () => {
        if (!selectedEmployee || !product) return;

        setIsSending(true);
        toast.info("Gerando documento e enviando...");

        try {
            const pdfBase64 = await generatePdfBase64();
            if (!pdfBase64) throw new Error("Falha ao gerar PDF.");

            const result = await sendTermEmail(selectedEmployee, product, adminName, pdfBase64);

            if (result.success) {
                toast.success(result.message);
                // Complete assignment with quantity
                await assignProduct(product.id, selectedEmployee.id, quantityToAssign, "Termo Enviado via Sistema");
                onClose();
                setSelectedEmployeeId("");
                setCurrentStep(1);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar envio.");
        } finally {
            setIsSending(false);
        }
    };

    const handleNext = () => {
        if (selectedEmployee) setCurrentStep(2);
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] md:max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Atribuir Produto - {currentStep === 1 ? "Seleção" : "Termo de Responsabilidade"}</DialogTitle>
                    <DialogDescription>
                        {currentStep === 1
                            ? "Selecione o funcionário responsável."
                            : "Confira o termo gerado e envie para assinatura via e-mail."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {currentStep === 1 && (
                        <div className="grid gap-4 py-4 max-w-md mx-auto">
                            <div className="grid gap-2">
                                <Label htmlFor="employee">Funcionário</Label>
                                <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um funcionário..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id}>
                                                {emp.name} - {emp.sector}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantidade a Atribuir (Máx: {product?.quantity})</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={product?.quantity}
                                    value={quantityToAssign}
                                    onChange={(e) => setQuantityToAssign(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && selectedEmployee && (
                        <div className="flex flex-col items-center">
                            <div className="border border-gray-200 shadow-sm w-full max-w-[210mm] bg-white overflow-hidden">
                                {/* Render Document for Preview - No scaling, full width container */}
                                <TermDocument
                                    ref={componentRef}
                                    product={product}
                                    quantity={quantityToAssign}
                                    employee={selectedEmployee}
                                    adminName={adminName}
                                    date={new Date()}
                                />
                            </div>

                            <div className="flex justify-center gap-4 mt-6 mb-4">
                                <Button variant="outline" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir / Salvar PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t mt-auto bg-muted/10">
                    {currentStep === 1 ? (
                        <>
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleNext} disabled={!selectedEmployeeId}>
                                Gerar Termo <FileText className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setCurrentStep(1)}>Voltar</Button>
                            <Button onClick={handleSendEmail} disabled={isSending}>
                                {isSending ? "Enviando..." : "Enviar p/ Email e Finalizar"}
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
