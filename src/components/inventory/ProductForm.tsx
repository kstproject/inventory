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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto px-1 pr-4">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            rules={{ required: "Título é obrigatório" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Produto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Furadeira Bosch" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            rules={{ required: "Categoria é obrigatória" }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma categoria" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantidade</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Unitário (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="assetType"
                                rules={{ required: "Selecione o tipo do bem" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo do Bem</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
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

                            <FormField
                                control={form.control}
                                name="serialNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nº de Série / Patrimônio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SN123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Detalhes do produto, estado de conservação, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <FormItem>
                            <FormLabel>Imagem do Produto</FormLabel>
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center p-6 min-h-[300px]">
                                    {imagePreview ? (
                                        <div className="relative w-full h-[250px]">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-contain rounded-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                                            <div className="text-sm text-muted-foreground mb-4">
                                                Cancele ou selecione um arquivo
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="max-w-xs mx-auto text-xs"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </FormItem>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">
                        {initialData ? "Salvar Alterações" : "Cadastrar Produto"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
