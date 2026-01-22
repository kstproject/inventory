import { create } from 'zustand';
import { Product, Employee, HistoryLog } from './types';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface InventoryState {
    products: Product[];
    employees: Employee[];
    isLoading: boolean;

    // Async Actions
    fetchData: () => Promise<void>;

    addProduct: (product: Omit<Product, 'id' | 'history' | 'status'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;

    assignProduct: (productId: string, employeeId: string, quantity: number, signature?: string) => Promise<void>;
    returnProduct: (productId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    employees: [],
    isLoading: false,

    fetchData: async () => {
        set({ isLoading: true });
        try {
            // Fetch Employees
            const { data: employeesData, error: empError } = await supabase
                .from('employees')
                .select('*');

            if (empError) throw empError;

            // Fetch Products with joined employee name (although we store assigned_to_name too)
            const { data: productsData, error: prodError } = await supabase
                .from('products')
                .select('*');

            if (prodError) throw prodError;

            // Fetch History for all products (could be optimized to fetch on demand, but ok for now)
            const { data: historyData, error: histError } = await supabase
                .from('history_logs')
                .select('*');

            if (histError) throw histError;

            // Map Supabase data to generic Types
            const mappedEmployees: Employee[] = employeesData.map((e: any) => ({
                id: e.id,
                name: e.name,
                cpf: e.cpf,
                sector: e.sector,
                email: e.email,
                phone: e.phone,
            }));

            const mappedProducts: Product[] = productsData.map((p: any) => {
                const productHistory = historyData
                    .filter((h: any) => h.product_id === p.id)
                    .map((h: any) => ({
                        id: h.id,
                        date: h.date,
                        action: h.action,
                        employeeId: h.employee_id,
                        employeeName: h.employee_name,
                        protocolSignature: h.protocol_signature,
                    }));

                return {
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    category: p.category,
                    quantity: p.quantity,
                    value: p.value,
                    status: p.status as any,
                    assignedToId: p.assigned_to_id,
                    assignedToName: p.assigned_to_name,
                    imageUrl: p.image_url,
                    serialNumber: p.serial_number,
                    assetType: p.asset_type || 'PERMANENT',
                    history: productHistory,
                };
            });

            set({ employees: mappedEmployees, products: mappedProducts });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Erro ao carregar dados do sistema.');
        } finally {
            set({ isLoading: false });
        }
    },

    addProduct: async (productData) => {
        try {
            const newId = uuidv4();
            const dbProduct = {
                id: newId,
                title: productData.title,
                description: productData.description,
                category: productData.category,
                quantity: productData.quantity,
                value: productData.value,
                image_url: productData.imageUrl,
                serial_number: productData.serialNumber,
                asset_type: productData.assetType,
                status: 'IN_STOCK',
            };

            const { error } = await supabase.from('products').insert(dbProduct);
            if (error) throw error;

            // Create initial history log
            const logId = uuidv4();
            const { error: logError } = await supabase.from('history_logs').insert({
                id: logId,
                product_id: newId,
                action: 'CREATED',
                date: new Date().toISOString(),
            });
            if (logError) console.error("Error logging history", logError);

            // Optimistic update or refetch
            await get().fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar produto.');
        }
    },

    updateProduct: async (id, updates) => {
        try {
            // Map updates to DB columns
            const dbUpdates: any = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.description) dbUpdates.description = updates.description;
            if (updates.category) dbUpdates.category = updates.category;
            if (updates.quantity) dbUpdates.quantity = updates.quantity;
            if (updates.value) dbUpdates.value = updates.value;
            if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
            if (updates.serialNumber) dbUpdates.serial_number = updates.serialNumber;
            if (updates.assetType) dbUpdates.asset_type = updates.assetType;

            const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
            if (error) throw error;

            await get().fetchData();
        } catch (error) {
            toast.error('Erro ao atualizar produto.');
        }
    },

    deleteProduct: async (id) => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;

            // Local update
            set((state) => ({ products: state.products.filter(p => p.id !== id) }));
        } catch (error) {
            toast.error('Erro ao excluir produto.');
        }
    },

    addEmployee: async (employeeData) => {
        try {
            const { error } = await supabase.from('employees').insert(employeeData);
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            toast.error('Erro ao adicionar funcionário.');
        }
    },

    updateEmployee: async (id, updates) => {
        try {
            const { error } = await supabase.from('employees').update(updates).eq('id', id);
            if (error) throw error;
            await get().fetchData();
        } catch (error) {
            toast.error('Erro ao atualizar funcionário.');
        }
    },

    deleteEmployee: async (id) => {
        try {
            const { error } = await supabase.from('employees').delete().eq('id', id);
            if (error) throw error;
            set((state) => ({ employees: state.employees.filter(e => e.id !== id) }));
        } catch (error) {
            toast.error('Erro ao excluir funcionário. Verifique se não há produtos atribuídos.');
        }
    },

    assignProduct: async (productId, employeeId, quantity, signature) => {
        try {
            const employee = get().employees.find(e => e.id === employeeId);
            const product = get().products.find(p => p.id === productId);

            if (!employee || !product) return;

            // If assigning full quantity
            if (quantity >= product.quantity) {
                const { error } = await supabase.from('products').update({
                    status: 'ASSIGNED',
                    assigned_to_id: employee.id,
                    assigned_to_name: employee.name,
                }).eq('id', productId);
                if (error) throw error;
            } else {
                // Partial assignment: Split product
                // 1. Decrement original product quantity
                const newOriginalQty = product.quantity - quantity;
                const { error: updateError } = await supabase.from('products').update({
                    quantity: newOriginalQty
                }).eq('id', productId);

                if (updateError) throw updateError;

                // 2. Create new product entry for assigned portion
                const newId = uuidv4();
                const newProduct = {
                    id: newId,
                    title: product.title,
                    description: product.description,
                    category: product.category,
                    quantity: quantity,
                    value: product.value,
                    image_url: product.imageUrl,
                    serial_number: product.serialNumber, // Copies SN, beware if unique
                    asset_type: product.assetType,
                    status: 'ASSIGNED',
                    assigned_to_id: employee.id,
                    assigned_to_name: employee.name
                };

                const { error: insertError } = await supabase.from('products').insert(newProduct);
                if (insertError) throw insertError;

                // Log creation of split item
                await supabase.from('history_logs').insert({
                    product_id: newId,
                    action: 'CREATED',
                    date: new Date().toISOString(),
                    employee_name: 'Sistema (Divisão de Lote)'
                });

                // Use the NEW ID for the assignment log below
                productId = newId;
            }

            // Log history
            const { error: logError } = await supabase.from('history_logs').insert({
                product_id: productId,
                action: 'ASSIGNED',
                employee_id: employee.id,
                employee_name: employee.name,
                protocol_signature: signature,
                date: new Date().toISOString(),
            });

            if (logError) console.error(logError);

            await get().fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atribuir produto.');
        }
    },

    returnProduct: async (productId) => {
        try {
            // Get current assignment info for log before clearing it
            const product = get().products.find(p => p.id === productId);

            const { error } = await supabase.from('products').update({
                status: 'IN_STOCK',
                assigned_to_id: null,
                assigned_to_name: null,
            }).eq('id', productId);

            if (error) throw error;

            // Log history
            const { error: logError } = await supabase.from('history_logs').insert({
                product_id: productId,
                action: 'RETURNED',
                employee_name: product?.assignedToName, // Keep snapshot
                date: new Date().toISOString(),
            });

            if (logError) console.error(logError);

            await get().fetchData();
        } catch (error) {
            toast.error('Erro ao devolver produto.');
        }
    }
}));
