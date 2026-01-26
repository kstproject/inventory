import { Edit, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onAssign: (product: Product) => void;
    onReturn: (product: Product) => void;
    onView?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onAssign, onReturn, onView }: ProductCardProps) {
    // State for delete confirmation
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    return (
        <>
            <Card className="overflow-hidden flex flex-col h-full bg-card hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onView && onView(product)}>
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Sem Imagem
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant={product.status === "IN_STOCK" ? "secondary" : "destructive"}>
                            {product.status === "IN_STOCK" ? "No Estoque" : "Em Uso"}
                        </Badge>
                    </div>
                </div>
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardDescription>{product.category}</CardDescription>
                            <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="font-medium text-lg">{formatCurrency(product.value)}</span>
                        <div className="text-xs text-muted-foreground">
                            Qtd: {product.quantity}
                        </div>
                    </div>
                    {product.status === "ASSIGNED" && (
                        <div className="mt-3 p-2 bg-muted/50 rounded-md text-xs flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span className="truncate">Com: <strong>{product.assignedToName}</strong></span>
                        </div>
                    )}
                    {/* Display Serial Number if exists */}
                    {product.serialNumber && (
                        <div className="mt-2 text-xs text-muted-foreground">
                            S/N: {product.serialNumber}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 pt-0 gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                    </Button>

                    {product.status === "IN_STOCK" ? (
                        <>
                            <Button size="sm" className="flex-1" onClick={() => onAssign(product)}>
                                Atribuir
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="w-9 px-0 shrink-0"
                                onClick={() => setIsDeleteOpen(true)}
                                title="Excluir Item"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" variant="secondary" className="flex-1" onClick={() => onReturn(product)}>
                            Devolver
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Item do Inventário?</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir <strong>{product.title}</strong>?
                            Essa ação não pode ser desfeita e ficará registrada no histórico.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDelete(product.id);
                                setIsDeleteOpen(false);
                            }}
                        >
                            Sim, Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
