"use client";

import { useEffect, useState } from "react";
import { Plus, Search, User, Trash2, Edit } from "lucide-react";
import { useInventoryStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Employee } from "@/lib/types";

export default function EmployeesPage() {
    const { employees, isLoading, fetchData, addEmployee, updateEmployee, deleteEmployee } = useInventoryStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [sector, setSector] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const filteredEmployees = employees.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmployee) {
            await updateEmployee(editingEmployee.id, { name, cpf, sector, email, phone });
            toast.success("Funcionário atualizado!");
        } else {
            await addEmployee({ name, cpf, sector, email, phone });
            toast.success("Funcionário cadastrado!");
        }
        setIsModalOpen(false);
        resetForm();
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setName(employee.name);
        setCpf(employee.cpf);
        setSector(employee.sector);
        setEmail(employee.email || "");
        setPhone(employee.phone || "");
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Excluir funcionário?")) {
            await deleteEmployee(id);
            toast.info("Funcionário removido.");
        }
    };

    const resetForm = () => {
        setEditingEmployee(null);
        setName("");
        setCpf("");
        setSector("");
        setEmail("");
        setPhone("");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
                    <p className="text-muted-foreground">
                        Gerencie quem pode receber os materiais da empresa.
                    </p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Funcionário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingEmployee ? "Editar" : "Novo"} Funcionário</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(XX) XXXXX-XXXX" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@empresa.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sector">Setor / Obra</Label>
                                <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} required placeholder="Ex: Obra Alpha, Administrativo..." />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Salvar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou setor..."
                            className="max-w-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>CPF</TableHead>
                                <TableHead>Setor</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        Nenhum funcionário encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {employee.name.charAt(0).toUpperCase()}
                                            </div>
                                            {employee.name}
                                        </TableCell>
                                        <TableCell>{employee.cpf}</TableCell>
                                        <TableCell>{employee.sector}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(employee.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
