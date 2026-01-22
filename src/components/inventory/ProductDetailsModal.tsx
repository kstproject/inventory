"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/lib/types";
import { ProductHistory } from "@/components/inventory/ProductHistory";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailsModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Detalhes do Produto</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
                        {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">Sem Imagem</div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold">{product.title}</h3>
                            <Badge variant={product.status === "IN_STOCK" ? "secondary" : "destructive"} className="mt-2 text-sm">
                                {product.status === "IN_STOCK" ? "Em Estoque" : "Em Uso"}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Categoria</span>
                                <p className="font-medium">{product.category}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Valor</span>
                                <p className="font-medium">{formatCurrency(product.value)}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Quantidade</span>
                                <p className="font-medium">{product.quantity}</p>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-3 rounded-md">
                            <span className="text-muted-foreground text-sm">Descrição</span>
                            <p className="text-sm mt-1">{product.description || "Sem descrição."}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-3">Histórico de Movimentações</h4>
                    <ProductHistory history={product.history} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
