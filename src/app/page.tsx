"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Box } from "lucide-react";
import { useInventoryStore } from "@/lib/store";
import { ProductCard } from "@/components/inventory/ProductCard";
import { ProductForm } from "@/components/inventory/ProductForm";
import { AssignModal } from "@/components/inventory/AssignModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/lib/types";
import { toast } from "sonner";

import { ProductDetailsModal } from "@/components/inventory/ProductDetailsModal";

export default function Dashboard() {
  const { products, isLoading, fetchData, addProduct, updateProduct, deleteProduct, returnProduct } = useInventoryStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [iscreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToAssign, setProductToAssign] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProduct = async (data: Omit<Product, "id" | "history" | "status">) => {
    await addProduct(data);
    setIsCreateOpen(false);
    toast.success("Produto criado com sucesso!");
  };

  const handleUpdateProduct = async (data: Omit<Product, "id" | "history" | "status">) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      toast.success("Produto atualizado!");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(id);
      toast.info("Produto removido.");
    }
  };

  const handleReturnProduct = async (product: Product) => {
    if (confirm(`Confirmar devolução de ${product.title}?`)) {
      await returnProduct(product.id);
      toast.success("Produto devolvido ao estoque.");
    }
  };

  const handleAssignProduct = (product: Product) => {
    setProductToAssign(product);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Gerencie seu inventário e ativos da empresa.
          </p>
        </div>
        <Dialog open={iscreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto shadow-md">
              <Plus className="mr-2 h-5 w-5" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para adicionar um item ao inventário.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="IN_STOCK">Em Estoque</SelectItem>
            <SelectItem value="ASSIGNED">Em Uso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Box className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Você ainda não tem produtos cadastrados ou sua busca não retornou resultados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={setEditingProduct}
              onDelete={handleDeleteProduct}
              onAssign={handleAssignProduct}
              onReturn={handleReturnProduct}
              onView={setViewingProduct}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Modal */}
      <AssignModal
        product={productToAssign}
        isOpen={!!productToAssign}
        onClose={() => setProductToAssign(null)}
      />

      {/* Details Modal */}
      <ProductDetailsModal
        product={viewingProduct}
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
      />
    </div>
  );
}
