"use client";

import React, { forwardRef } from 'react';
import { Product, Employee } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface TermDocumentProps {
    product: Product;
    quantity: number;
    employee: Employee;
    adminName: string;
    date: Date;
}

export const TermDocument = forwardRef<HTMLDivElement, TermDocumentProps>((props, ref) => {
    const { product, quantity, employee, adminName, date } = props;

    return (
        <div ref={ref} className="p-12 max-w-4xl mx-auto bg-white text-black font-serif">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                {/* Logo Placeholder */}
                <div className="w-16 h-16 relative">
                    <Image
                        src="/img/logobaptista.png"
                        alt="Logo Baptista Leal"
                        fill
                        className="object-contain"
                        unoptimized // Important for html2canvas to capture local file
                    />
                </div>
                <div>
                    <h1 className="text-xl font-bold uppercase leading-tight" style={{ color: '#1e3a8a' }}>Construtora<br />Baptista Leal</h1>
                </div>
            </div>

            <h2 className="text-center font-bold text-lg mb-8 uppercase border-b-2 border-black pb-2">
                Termo de Responsabilidade pela Guarda e Uso do Equipamento de Trabalho
            </h2>

            {/* Employee Info */}
            <div className="space-y-2 mb-6 text-sm">
                <p><strong>Nome:</strong> {employee.name}</p>
                <p><strong>CPF:</strong> {employee.cpf}</p>
                <p><strong>Fone para Contato:</strong> {employee.phone || "Não informado"}</p>
                <p><strong>E-mail:</strong> {employee.email || "Não informado"}</p>
                <p><strong>SETOR & LOCAL (ESCRITÓRIO, OBRA, ETC):</strong> {employee.sector}</p>
            </div>

            {/* Text Body */}
            <div className="text-sm text-justify mb-6 space-y-4">
                <p>
                    Recebi da empresa <strong>CONSTRUTORA BAPTISTA LEAL</strong>, CNPJ nº 02.218.050/0001-75,
                    a título de empréstimo, para meu uso exclusivo de trabalho, os equipamentos especificados
                    neste termo de responsabilidade, comprometendo-me a mantê-los em perfeito estado de
                    conservação, ficando ciente de que:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e <strong>descontará</strong> o valor de um equipamento da mesma marca ou equivalente ao da praça.</li>
                    <li>Em Hipótese alguma é permitido a instalação de softwares, desde que seja solicitado ao setor de TI onde o setor constatando a real necessidade fará a instalação de softwares legítimos apenas.</li>
                    <li>Em caso de dano, inutilização ou extravio do equipamento deverei comunicar imediatamente ao setor competente.</li>
                    <li>Terminando os serviços ou no caso de rescisão do contrato de trabalho, deverei devolver o equipamento completo e em perfeito estado de conservação, considerando-se o tempo de uso do mesmo, ao setor competente.</li>
                    <li>Estando os equipamentos em minha posse, estarei sujeito a inspeções sem prévio aviso.</li>
                </ol>
            </div>

            {/* Product Table */}
            <table className="w-full border-collapse border border-black mb-8 text-sm">
                <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th className="border border-black p-2">Item</th>
                        <th className="border border-black p-2">Nº Série / Tombamento</th>
                        <th className="border border-black p-2">Especificação (série, imei, modelo, marca)</th>
                        <th className="border border-black p-2">Tipo do Bem</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-2 text-center">{quantity}</td>
                        <td className="border border-black p-2 text-center">{product.serialNumber || "-"}</td>
                        <td className="border border-black p-2">
                            {product.title} - {product.description}
                        </td>
                        <td className="border border-black p-2 text-xs">
                            <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" readOnly checked={product.assetType === 'PERMANENT'} /> Permanente
                                </label>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" readOnly checked={product.assetType === 'CONSUMABLE'} /> Consumo
                                </label>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" readOnly checked={product.assetType === 'USED'} /> Usado
                                </label>
                                <label className="flex items-center gap-1">
                                    <input type="checkbox" readOnly checked={product.assetType === 'NEW'} /> Novo
                                </label>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Signatures */}
            <div className="flex justify-between items-end mt-12 mb-8 text-sm">
                <div>
                    <p>Recife, {date.toLocaleDateString('pt-BR')}</p>
                </div>
            </div>

            <div className="flex gap-8 justify-between mt-16 text-sm">
                <div className="flex-1 text-center">
                    <div className="border-t border-black pt-2 mb-1">
                        {employee.name}
                    </div>
                    <div>Responsável Usuário</div>
                </div>

                <div className="flex-1 text-center">
                    <div className="border-t border-black pt-2 mb-1">
                        {adminName}
                    </div>
                    <div>Responsável TI</div>
                </div>
            </div>

            {/* Footer - Return Receipt */}
            <div className="mt-12 border-t-2 border-dashed border-black pt-4">
                <h3 className="text-center font-bold uppercase mb-4">Comprovante de Devolução</h3>
                <p className="text-sm mb-4">
                    Atestamos que o bem foi devolvido em ___/___/___, nas seguintes condições:
                </p>
                <div className="flex gap-4 text-sm mb-12">
                    <label className="flex items-center gap-1"><input type="checkbox" /> Em perfeito estado</label>
                    <label className="flex items-center gap-1"><input type="checkbox" /> Apresentando defeito</label>
                    <label className="flex items-center gap-1"><input type="checkbox" /> Faltando peças ou acessórios</label>
                </div>

                <div className="flex gap-8 justify-between mt-8 text-sm">
                    <div className="flex-1 text-center">
                        __________________________________
                        <div>Responsável Usuário</div>
                    </div>
                    <div className="flex-1 text-center">
                        __________________________________
                        <div>Responsável TI</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

TermDocument.displayName = "TermDocument";
