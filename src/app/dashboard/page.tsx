"use client";

import { useEffect, useState } from "react";
import { useInventoryStore } from "@/lib/store";
import { ProductCard } from "@/components/inventory/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { ProductForm } from "@/components/inventory/ProductForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AssignModal } from "@/components/inventory/AssignModal";
import { Product } from "@/lib/types";

export default function DashboardPage() {
    const { products, fetchData, addProduct, updateProduct, deleteProduct, returnProduct } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProducts = products.filter(p =>
        p.status !== 'DELETED' && (
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleAddProduct = async (data: any) => {
        await addProduct(data);
        setIsAddModalOpen(false);
    };

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (data: any) => {
        if (editingProduct) {
            await updateProduct(editingProduct.id, data);
            setIsEditModalOpen(false);
            setEditingProduct(undefined);
        }
    };

    // Assign Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const handleAssignClick = (product: Product) => {
        setSelectedProductId(product.id);
        setAssignModalOpen(true);
    };

    // Derived state for AssignModal to ensure freshness
    const selectedProductForAssign = products.find(p => p.id === selectedProductId) || null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, categoria ou SN..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>

                    {/* Add Modal */}
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#1e3a8a] text-white gap-2 flex-1 md:flex-none">
                                <Plus className="h-4 w-4" /> Novo Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0">
                            <DialogHeader className="px-6 pt-6">
                                <DialogTitle>Cadastrar Novo Item no Inventário</DialogTitle>
                            </DialogHeader>
                            <div className="p-6">
                                <ProductForm
                                    onSubmit={handleAddProduct}
                                    onCancel={() => setIsAddModalOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="max-w-4xl p-0">
                            <DialogHeader className="px-6 pt-6">
                                <DialogTitle>Editar Item</DialogTitle>
                            </DialogHeader>
                            <div className="p-6">
                                <ProductForm
                                    initialData={editingProduct}
                                    onSubmit={handleUpdateProduct}
                                    onCancel={() => setIsEditModalOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={(p) => handleEditClick(p)}
                        onDelete={(id) => deleteProduct(id)}
                        onAssign={(p) => handleAssignClick(p)}
                        onReturn={(p) => returnProduct(p.id)}
                    />
                ))}

                {/* Modals */}
                <AssignModal
                    product={selectedProductForAssign}
                    isOpen={assignModalOpen}
                    onClose={() => {
                        setAssignModalOpen(false);
                        setSelectedProductId(null);
                    }}
                />

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl border-muted">
                        <div className="text-muted-foreground">Nenhum item encontrado.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
