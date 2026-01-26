import { create } from 'zustand';
import { Product, Employee, HistoryLog } from './types';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface InventoryState {
    products: Product[];
    employees: Employee[];
    isLoading: boolean;

    categories: string[];
    logs: HistoryLog[];

    // Async Actions
    fetchData: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    addCategory: (name: string) => Promise<void>;

    addProduct: (product: Omit<Product, 'id' | 'history' | 'status'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;

    assignProduct: (productId: string, employeeId: string, quantity: number, signature?: string, transactionId?: string) => Promise<void>;
    returnProduct: (productId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    products: [],
    employees: [],
    categories: ["Ferramentas Elétricas", "EPIs", "Informática", "Veículos", "Móveis", "Outros"],
    logs: [], // Global history logs
    isLoading: false,

    fetchCategories: async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (data && !error) {
                set({ categories: data.map((c: any) => c.name) });
            }
        } catch (error) {
            // Silent fail, use defaults
        }
    },

    addCategory: async (name: string) => {
        try {
            const { error } = await supabase.from('categories').insert({ name });
            if (!error) {
                set((state) => ({ categories: [...state.categories, name] }));
                toast.success("Categoria adicionada!");
            } else {
                // Fallback if table doesn't exist
                set((state) => ({ categories: [...state.categories, name] }));
                toast.success("Categoria adicionada (Localmente)!");
            }
        } catch (error) {
            toast.error("Erro ao adicionar categoria.");
        }
    },

    fetchData: async () => {
        set({ isLoading: true });
        console.log("Starting fetchData...");
        console.log("Supabase URL Check:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "UNDEFINED");

        try {
            // Fetch Employees
            console.log("Fetching employees...");
            const { data: employeesData, error: empError } = await supabase
                .from('employees')
                .select('*');

            if (empError) {
                console.error("Employee Fetch Error:", empError);
                throw empError;
            }

            // Fetch Products
            console.log("Fetching products...");
            const { data: productsData, error: prodError } = await supabase
                .from('products')
                .select('*');

            if (prodError) {
                console.error("Product Fetch Error:", prodError);
                throw prodError;
            }

            // Fetch History
            console.log("Fetching history...");
            const { data: historyData, error: histError } = await supabase
                .from('history_logs')
                .select('*');

            if (histError) {
                console.error("History Fetch Error:", histError);
                throw histError;
            }

            console.log("All data fetched, mapping...");
            // Map Supabase data to generic Types
            const mappedEmployees: Employee[] = (employeesData || []).map((e: any) => ({
                id: e.id,
                name: e.name,
                cpf: e.cpf,
                sector: e.sector,
                email: e.email,
                phone: e.phone,
            }));

            // Map Logs Global
            const mappedLogs: HistoryLog[] = (historyData || []).map((h: any) => ({
                id: h.id,
                date: h.date,
                action: h.action,
                employeeId: h.employee_id,
                employeeName: h.employee_name,
                protocolSignature: h.protocol_signature,
                transactionId: h.transaction_id,
                productId: h.product_id,
            })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const mappedProducts: Product[] = (productsData || []).map((p: any) => {
                const productHistory = mappedLogs
                    .filter((h: any) => h.productId === p.id);

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
                    currentTransactionId: p.current_transaction_id
                };
            });

            set({ employees: mappedEmployees, products: mappedProducts, logs: mappedLogs });
        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error('Erro de conexão com o banco de dados. Verifique sua rede.');
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
            // 1. Fetch product details before deletion for the log
            const product = get().products.find(p => p.id === id);

            if (!product) {
                // Try fetching from DB if not in local state (unlikely but safe)
                const { data } = await supabase.from('products').select('*').eq('id', id).single();
                if (!data) return; // Already gone
            }

            const productName = product?.title || "Item Desconhecido";

            // 2. Log the deletion
            // Note: If history_logs has a CASCADE delete on product_id, this log might disappear.
            // Ideally, history_logs should separate product_id or set it to NULL on delete. 
            // We insert it with the ID. If it disappears, we at least tried. 
            // Better: Store the product name in 'employee_name' or a generic text field to preserve context if ID is lost/nulled.
            // Using 'employee_name' field to store "Item: [Name]" for now as a fallback for text details.
            await supabase.from('history_logs').insert({
                product_id: id,
                action: 'DELETED',
                employee_name: `Produto Excluído: ${productName}`, // Storing name here to preserve it
                date: new Date().toISOString(),
            });

            // 3. Soft Delete in DB
            const { error } = await supabase.from('products').update({ status: 'DELETED' }).eq('id', id);
            if (error) throw error;

            // 4. Local update (mark as deleted, don't remove from state so Audit can see it)
            set((state) => ({
                products: state.products.map(p =>
                    p.id === id ? { ...p, status: 'DELETED' } : p
                )
            }));
            toast.success("Produto excluído e registrado no histórico.");
        } catch (error) {
            console.error("Erro ao excluir:", error);
            toast.error('Erro ao excluir produto. Verifique se existem dependências.');
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

    assignProduct: async (productId, employeeId, quantity, signature, transactionId) => {
        try {
            // Use Server Action for reliable assignment
            const { assignProductAction } = await import('@/app/actions');
            const result = await assignProductAction(productId, employeeId, quantity, transactionId || "");

            if (result.success) {
                toast.success(result.message);
                await get().fetchData();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error("AssignProduct Error:", error);
            toast.error(`Erro: ${error.message || "Falha na atribuição."}`);
            throw error; // Re-throw to stop caller
        }
    },

    returnProduct: async (productId) => {
        try {
            const product = get().products.find(p => p.id === productId);
            if (!product) return;

            // Smart Merge Logic: Find an existing identical product in IN_STOCK
            // Criteria: Same Title, Category, AssetType, Value AND Same Serial Number (or both undefined)

            let targetProductId = productId;
            let merged = false;

            // Allow merge if assetType is CONSUMABLE OR if they are basically the same item (same SN)
            if (true) {
                const existingStack = get().products.find(p =>
                    p.id !== productId &&
                    p.status === 'IN_STOCK' &&
                    p.title === product.title &&
                    p.category === product.category &&
                    p.value === product.value &&
                    p.assetType === product.assetType &&
                    (p.serialNumber === product.serialNumber || (!p.serialNumber && !product.serialNumber))
                );

                if (existingStack) {
                    // Merge!
                    const newQty = existingStack.quantity + product.quantity;

                    // 1. Update existing stack
                    await supabase.from('products').update({ quantity: newQty }).eq('id', existingStack.id);

                    // 2. Delete the returned item (it's now part of existing stack)
                    await supabase.from('products').delete().eq('id', productId);

                    // 3. Point history of returned item to existing stack
                    await supabase.from('history_logs').update({ product_id: existingStack.id }).eq('product_id', productId);

                    merged = true;
                    targetProductId = existingStack.id;
                }
            }

            if (!merged) {
                // Just reset status if no merge
                const { error } = await supabase.from('products').update({
                    status: 'IN_STOCK',
                    assigned_to_id: null,
                    assigned_to_name: null
                }).eq('id', productId);
                if (error) throw error;
            }

            // Log history
            const { error: logError } = await supabase.from('history_logs').insert({
                product_id: targetProductId,
                action: 'RETURNED',
                employee_name: product.assignedToName,
                transaction_id: product.currentTransactionId, // keep track of which transaction this return closes
                date: new Date().toISOString(),
            });

            if (logError) console.error(logError);

            await get().fetchData();
            toast.success("Produto devolvido com sucesso.");
        } catch (error) {
            console.error(error);
            toast.error('Erro ao devolver produto.');
        }
    }
}));
