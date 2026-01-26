export type ProductStatus = 'IN_STOCK' | 'ASSIGNED' | 'DELETED';

export interface HistoryLog {
    id: string;
    date: string; // ISO String
    action: 'CREATED' | 'ASSIGNED' | 'RETURNED' | 'CONSUMED' | 'DELETED';
    employeeId?: string;
    employeeName?: string;
    previousStatues?: ProductStatus;
    protocolSignature?: string; // Could be a simple "Assigned to X" string or a base64 signature
    adminName?: string;
    transactionId?: string; // New: Link to PDF/Contract
    productId?: string;
}

export type AssetType = 'PERMANENT' | 'CONSUMABLE' | 'USED' | 'NEW';

export interface Product {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: number; // For non-unique items, or usually 1 for unique assets linked to an ID
    value: number;
    status: ProductStatus;
    assetType: AssetType;
    serialNumber?: string;
    assignedToId?: string; // Links to Employee
    assignedToName?: string; // Denormalized for easier display/history
    imageUrl?: string;
    history: HistoryLog[];
    currentTransactionId?: string; // New: Active assignment contract ID
}

export interface AuditLog {
    id: string;
    action: string;
    details: string;
    userId: string;
    timestamp: string;
}

export interface Employee {
    id: string;
    name: string;
    cpf: string;
    sector: string;
    email?: string;
    phone?: string;
}
