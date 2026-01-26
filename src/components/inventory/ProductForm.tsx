"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Product, AssetType } from "@/lib/types";
import { useInventoryStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (data: Omit<Product, "id" | "history" | "status">) => void;
    onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
    const { categories, fetchCategories } = useInventoryStore();

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);

    const form = useForm({
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            category: initialData?.category || "",
            quantity: initialData?.quantity || 1,
            value: initialData?.value || 0,
            imageUrl: initialData?.imageUrl || "",
            serialNumber: initialData?.serialNumber || "",
            assetType: initialData?.assetType || "PERMANENT",
        },
    });

    // EFFECT: Reset form when initialData changes (fixes "modal broken" issue)
    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                description: initialData.description || "",
                category: initialData.category,
                quantity: initialData.quantity,
                value: initialData.value,
                imageUrl: initialData.imageUrl || "",
                serialNumber: initialData.serialNumber || "",
                assetType: initialData.assetType || "PERMANENT",
            });
            setImagePreview(initialData.imageUrl || null);
        } else {
            form.reset({
                title: "",
                description: "",
                category: "",
                quantity: 1,
                value: 0,
                imageUrl: "",
                serialNumber: "",
                assetType: "PERMANENT",
            });
            setImagePreview(null);
        }
    }, [initialData, form]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("Imagem muito grande. Máximo 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                form.setValue("imageUrl", base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        form.setValue("imageUrl", "");
    };

    const handleSubmit = (data: any) => {
        onSubmit({
            title: data.title,
            description: data.description,
            category: data.category,
            quantity: Number(data.quantity),
            value: Number(data.value),
            imageUrl: data.imageUrl,
            serialNumber: data.serialNumber,
            assetType: data.assetType as AssetType,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-y-auto p-1">

                    {/* LEFT COLUMN: FIELDS (Spans 7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        <FormField
                            control={form.control}
                            name="title"
                            rules={{ required: "Título é obrigatório" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Produto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Furadeira Bosch GSB 13" className="bg-slate-50 border-slate-200 focus:bg-white transition-colors" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                rules={{ required: "Categoria é obrigatória" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantidade</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" className="bg-slate-50 border-slate-200 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Unitário (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" className="bg-slate-50 border-slate-200 focus:bg-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="assetType"
                                rules={{ required: "Selecione o tipo do bem" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo do Bem</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PERMANENT">Permanente</SelectItem>
                                                <SelectItem value="CONSUMABLE">Consumo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="serialNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nº de Série / Patrimônio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="SN123456" className="bg-slate-50 border-slate-200 focus:bg-white font-mono uppercase" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalhes adicionais do produto..."
                                            className="bg-slate-50 border-slate-200 focus:bg-white resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* RIGHT COLUMN: IMAGE (Spans 5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <FormLabel className="block mb-2">Imagem do Produto</FormLabel>
                        <div className="h-full max-h-[400px]">
                            {imagePreview ? (
                                <div className="relative w-full h-64 lg:h-full min-h-[250px] border rounded-xl overflow-hidden bg-slate-100 group">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-contain p-2"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={removeImage}
                                            className="shadow-lg"
                                        >
                                            <X className="h-4 w-4 mr-2" /> Remover Imagem
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-64 lg:h-full min-h-[250px] border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <p className="mb-2 text-sm text-slate-500 font-medium">Clique para enviar uma foto</p>
                                        <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                    <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-900">
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white min-w-[150px]">
                        {initialData ? "Salvar Alterações" : "Cadastrar Produto"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
