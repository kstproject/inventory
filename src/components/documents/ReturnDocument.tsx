"use client";

import React, { forwardRef } from 'react';
import { Product, Employee } from '@/lib/types';
import Image from 'next/image';

interface ReturnDocumentProps {
    items: Product[];
    employee: Employee;
    date: Date;
}

export const ReturnDocument = forwardRef<HTMLDivElement, ReturnDocumentProps>((props, ref) => {
    const { items, employee, date } = props;

    return (
        <div ref={ref} className="p-12 max-w-4xl mx-auto font-serif" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .pdf-standard-table { border-collapse: collapse; width: 100%; border: 1px solid #000000; }
                .pdf-standard-table th, .pdf-standard-table td { border: 1px solid #000000; padding: 8px; }
                .pdf-header-row { background-color: #f3f4f6 !important; }
            ` }} />
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 relative">
                    <Image
                        src="/img/logobaptista.png"
                        alt="Logo Baptista Leal"
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
                <div>
                    <h1 className="text-xl font-bold uppercase leading-tight" style={{ color: '#1e3a8a' }}>Construtora<br />Baptista Leal</h1>
                </div>
            </div>

            <h2 className="text-center font-bold text-lg mb-8 uppercase pb-2" style={{ borderBottom: '2px solid #000000' }}>
                Termo de Devolução de Equipamento de Trabalho
            </h2>

            {/* Employee Info */}
            <div className="space-y-2 mb-6 text-sm">
                <p><strong>Nome:</strong> {employee.name}</p>
                <p><strong>CPF:</strong> {employee.cpf}</p>
                <p><strong>E-mail:</strong> {employee.email || "Não informado"}</p>
                <p><strong>SETOR & LOCAL:</strong> {employee.sector}</p>
            </div>

            {/* Text Body */}
            <div className="text-sm text-justify mb-6 space-y-4">
                <p>
                    Atesto que estou devolvendo à empresa <strong>CONSTRUTORA BAPTISTA LEAL</strong> os equipamentos
                    relacionados abaixo, os quais estavam sob minha responsabilidade para uso exclusivo de trabalho.
                </p>
                <p>
                    A devolução está sendo realizada para fins de baixa de responsabilidade no sistema de inventário.
                </p>
            </div>

            {/* Product Table */}
            <table className="pdf-standard-table mb-8 text-sm">
                <thead>
                    <tr className="pdf-header-row">
                        <th>Qtd</th>
                        <th>Item</th>
                        <th>Nº Série</th>
                        <th>Categoria</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="text-center">{item.quantity}</td>
                            <td>{item.title}</td>
                            <td className="text-center">{item.serialNumber || "-"}</td>
                            <td className="text-center">{item.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Signature Area */}
            <div className="mt-12 text-sm">
                <p>Recife, {date.toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="flex gap-12 justify-between mt-24 text-sm">
                <div className="flex-1 text-center">
                    <div className="pt-2 mb-1" style={{ borderTop: '1px solid #000000' }}>
                        {employee.name}
                    </div>
                    <div>Assinatura do Funcionário</div>
                </div>

                <div className="flex-1 text-center">
                    <div className="pt-2 mb-1" style={{ borderTop: '1px solid #000000' }}>
                        &nbsp;
                    </div>
                    <div>Recebido por (Almoxarifado)</div>
                </div>
            </div>

            <div className="mt-8 text-[10px] style={{ color: '#9ca3af' }} text-center">
                Documento gerado eletronicamente através do Portal de Ativos Baptista Leal.
            </div>
        </div>
    );
});

ReturnDocument.displayName = "ReturnDocument";
