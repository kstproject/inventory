"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadLegacyContractAction } from "@/app/actions";
import { useInventoryStore } from "@/lib/store";

interface LegacyImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function LegacyImportModal({ isOpen, onClose, onSuccess }: LegacyImportModalProps) {
    const { categories, fetchCategories } = useInventoryStore();
    const [employees, setEmployees] = useState<any[]>([]);

    // Form State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [isSigned, setIsSigned] = useState(true);
    const [file, setFile] = useState<File | null>(null);

    // Product State (New Item)
    const [productTitle, setProductTitle] = useState("");
    const [productCategory, setProductCategory] = useState("");
    const [productSn, setProductSn] = useState("");
    const [productValue, setProductValue] = useState("");
    const [productAssetType, setProductAssetType] = useState("PERMANENT");

    // UI State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            fetchCategories();
        } else {
            // Reset
            setFile(null);
            setPreviewUrl(null);
            setSelectedEmployeeId("");
            setProductTitle("");
            setProductCategory("");
            setProductSn("");
            setProductValue("");
        }
    }, [isOpen, fetchCategories]);

    const fetchEmployees = async () => {
        const { data } = await supabase.from('employees').select('id, name').order('name');
        setEmployees(data || []);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async () => {
        if (!file || !selectedEmployeeId || !productTitle || !productCategory) {
            toast.error("Preencha os campos obrigatórios (Arquivo, Funcionário, Nome do Item, Categoria).");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('employeeId', selectedEmployeeId);
            formData.append('isSigned', String(isSigned));

            // Append Product Details
            const productData = {
                title: productTitle,
                category: productCategory,
                serialNumber: productSn,
                value: Number(productValue),
                assetType: productAssetType,
                quantity: 1 // Legacy items usually 1:1
            };
            formData.append('product', JSON.stringify(productData));

            const result = await uploadLegacyContractAction(formData);

            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onClose();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Erro desconhecido.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Importar Contrato Legado e Item</DialogTitle>
                    <DialogDescription>
                        Cadastre o item que já está com o funcionário e anexe o contrato antigo.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {/* LEFT COLUMN: ITEM DETAILS */}
                    <div className="space-y-4 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6 border-dashed">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-100 p-1.5 rounded-full text-blue-800 font-bold text-xs">1</div>
                            <h4 className="font-semibold text-sm text-gray-900">Detalhes do Item</h4>
                        </div>

                        <div className="grid gap-2">
                            <Label>Nome do Item *</Label>
                            <Input
                                placeholder="Ex: Notebook Dell G15"
                                value={productTitle}
                                onChange={(e) => setProductTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Categoria *</Label>
                            <Select onValueChange={setProductCategory} value={productCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Valor R$</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={productValue}
                                    onChange={(e) => setProductValue(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipo</Label>
                                <Select onValueChange={setProductAssetType} value={productAssetType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERMANENT">Permanente</SelectItem>
                                        <SelectItem value="CONSUMABLE">Consumo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Nº Série / Patrimônio</Label>
                            <Input
                                placeholder="SN..."
                                value={productSn}
                                onChange={(e) => setProductSn(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTRACT DETAILS */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-amber-100 p-1.5 rounded-full text-amber-800 font-bold text-xs">2</div>
                            <h4 className="font-semibold text-sm text-gray-900">Dados do Contrato</h4>
                        </div>

                        <div className="grid gap-2">
                            <Label>Funcionário (Quem está com o item?) *</Label>
                            <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Arquivo (Foto ou PDF) *</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors text-center cursor-pointer relative">
                                <Input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    {file ? file.name : "Clique para anexar"}
                                </span>
                            </div>
                        </div>

                        {previewUrl && file?.type.startsWith('image/') && (
                            <div className="relative border rounded h-40 overflow-hidden bg-black/5 flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                            </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                            <Checkbox id="signed" checked={isSigned} onCheckedChange={(c) => setIsSigned(!!c)} />
                            <Label htmlFor="signed" className="font-medium">O contrato já está assinado?</Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedEmployeeId || !file || !productTitle}>
                        {loading ? "Processando..." : "Criar Item & Importar Contrato"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
