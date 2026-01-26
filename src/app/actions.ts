"use server";

import { Employee, Product } from "@/lib/types";

export async function sendTermEmail(
    employee: Employee,
    product: Product,
    adminName: string,
    pdfBase64: string
) {
    console.log(`[Server Action] Sending data to n8n for ${employee.email}...`);

    // N8N Webhook URL - Ideally from env var
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
        console.warn("N8N_WEBHOOK_URL not set. Simulating success.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: "Simulação: Enviado para n8n (Webhook não configurado)." };
    }

    try {
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee,
                product,
                adminName,
                pdfBase64,
                timestamp: new Date().toISOString(),
                returnLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/return`
            })
        });

        if (!response.ok) {
            throw new Error(`n8n responded with ${response.status}`);
        }

        return { success: true, message: `Termo enviado para processamento (n8n).` };
    } catch (error) {
        console.error("Error sending to n8n:", error);
        return { success: false, message: "Erro ao conectar com n8n." };
    }
}

import { createClient } from '@supabase/supabase-js';


export async function createAdminUser(email: string, password: string) {
    console.log(`[Server Action] Creating admin user ${email}...`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("SUPABASE_SERVICE_ROLE_KEY not set. Cannot create users via API.");
        return { success: false, message: "Erro: Chave de serviço não configurada no servidor." };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        const { data, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (error) throw error;

        return { success: true, message: `Administrador ${email} criado com sucesso!` };
    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, message: error.message || "Erro ao criar usuário." };
    }
}

export async function assignProductAction(
    productId: string,
    employeeId: string,
    quantity: number,
    transactionId: string
) {
    console.log(`[Server Action] Assigning product ${productId} to ${employeeId}...`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, message: "Erro de configuração do servidor." };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Fetch Product and Employee
        const { data: product, error: prodError } = await adminClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (prodError || !product) throw new Error("Produto não encontrado.");

        const { data: employee, error: empError } = await adminClient
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .single();

        if (empError || !employee) throw new Error("Funcionário não encontrado.");

        // 2. Logic based on Asset Type
        if (product.asset_type === 'CONSUMABLE') {
            const newQty = product.quantity - quantity;
            if (newQty < 0) return { success: false, message: "Quantidade insuficiente." };

            const { error: updateError } = await adminClient
                .from('products')
                .update({ quantity: newQty })
                .eq('id', productId);

            if (updateError) throw updateError;

            // Log Consumption
            await adminClient.from('history_logs').insert({
                product_id: productId,
                action: 'CONSUMED',
                employee_id: employee.id,
                employee_name: employee.name,
                transaction_id: transactionId,
                date: new Date().toISOString()
            });

            return { success: true, message: `Consumo registrado para ${employee.name}` };
        }

        // PERMANENT / ASSET Logic
        let targetProductId = productId;

        if (quantity >= product.quantity) {
            // Full Assignment
            const { error: updateError } = await adminClient
                .from('products')
                .update({
                    status: 'ASSIGNED',
                    assigned_to_id: employee.id,
                    assigned_to_name: employee.name
                })
                .eq('id', productId);

            if (updateError) throw updateError;
        } else {
            // Partial Assignment (Split)
            const newOriginalQty = product.quantity - quantity;

            // A. Update Original
            const { error: updateError } = await adminClient
                .from('products')
                .update({ quantity: newOriginalQty })
                .eq('id', productId);

            if (updateError) throw updateError;

            // B. Create New Assigned Item
            const newId = crypto.randomUUID();
            targetProductId = newId;

            const { error: insertError } = await adminClient
                .from('products')
                .insert({
                    id: newId,
                    title: product.title,
                    description: product.description,
                    category: product.category,
                    quantity: quantity,
                    value: product.value,
                    image_url: product.image_url,
                    serial_number: product.serial_number,
                    asset_type: product.asset_type,
                    status: 'ASSIGNED',
                    assigned_to_id: employee.id,
                    assigned_to_name: employee.name
                });

            if (insertError) throw insertError;

            // Log Creation of Split
            await adminClient.from('history_logs').insert({
                product_id: newId,
                action: 'CREATED',
                date: new Date().toISOString(),
                employee_name: 'Sistema (Divisão de Lote)'
            });
        }

        // 3. Log Assignment History
        await adminClient.from('history_logs').insert({
            product_id: targetProductId,
            action: 'ASSIGNED',
            employee_id: employee.id,
            employee_name: employee.name,
            transaction_id: transactionId,
            date: new Date().toISOString()
        });

        return { success: true, message: "Produto atribuído com sucesso." };

    } catch (error: any) {
        console.error("Assign Action Error:", error);
        return { success: false, message: error.message || "Erro ao atribuir produto." };
    }
}

export async function uploadReturnAction(formData: FormData) {
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    const itemsJson = formData.get('items') as string;
    const actionType = formData.get('actionType') as 'DELIVERY' | 'RETURN';

    if (!file || !employeeId || !itemsJson || !actionType) {
        return { success: false, message: "Dados incompletos." };
    }

    const items = JSON.parse(itemsJson);

    console.log(`[Server Action] Processing ${actionType} for ${employeeId} with ${items.length} items...`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, message: "Erro de configuração do servidor." };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Upload File
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${employeeId}_${actionType}.${fileExt}`;
        const filePath = `contracts/${fileName}`;

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await adminClient.storage
            .from('contracts')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = adminClient.storage
            .from('contracts')
            .getPublicUrl(filePath);

        // 2. Process Items
        for (const productId of items) {
            // A. Register Contract
            const { error: contractError } = await adminClient
                .from('signed_contracts')
                .insert({
                    employee_id: employeeId,
                    product_id: productId,
                    type: actionType,
                    file_url: publicUrl,
                    status: 'PENDING_VERIFICATION'
                });

            if (contractError) throw contractError;

            // B. If RETURN, update product status
            if (actionType === 'RETURN') {
                // Fetch to get current assignment details for log
                const { data: product } = await adminClient
                    .from('products')
                    .select('assigned_to_name')
                    .eq('id', productId)
                    .single();

                const { error: productError } = await adminClient
                    .from('products')
                    .update({
                        status: 'IN_STOCK',
                        assigned_to_id: null,
                        assigned_to_name: null
                    })
                    .eq('id', productId);

                if (productError) throw productError;

                // Log History
                await adminClient.from('history_logs').insert({
                    product_id: productId,
                    action: 'RETURNED',
                    employee_name: product?.assigned_to_name,
                    date: new Date().toISOString()
                });
            }
        }

        return { success: true, message: actionType === 'RETURN' ? "Devolução registrada com sucesso!" : "Entrega confirmada com sucesso!" };

    } catch (error: any) {
        console.error("Upload Action Error:", error);
        return { success: false, message: error.message || "Erro ao processar solicitação." };
    }
}

export async function uploadLegacyContractAction(formData: FormData) {
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    const isSigned = formData.get('isSigned') === 'true';
    const productJson = formData.get('product') as string; // NEW: Product Payload

    if (!file || !employeeId) {
        return { success: false, message: "Arquivo e Funcionário são obrigatórios." };
    }

    console.log(`[Server Action] Uploading legacy contract for ${employeeId}...`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, message: "Erro de configuração do servidor." };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 0. Fetch Employee Name (needed for Product Assignment)
        const { data: employee, error: empError } = await adminClient
            .from('employees')
            .select('name')
            .eq('id', employeeId)
            .single();

        if (empError || !employee) throw new Error("Funcionário não encontrado.");

        // 1. Upload File
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_legacy_${employeeId}.${fileExt}`;
        const filePath = `contracts/legacy/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await adminClient.storage
            .from('contracts')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = adminClient.storage
            .from('contracts')
            .getPublicUrl(filePath);

        // 2. Create Product (If provided)
        let productId = null;
        const transactionId = `LEGACY-${Date.now()}`;

        if (productJson) {
            const productData = JSON.parse(productJson);
            productId = crypto.randomUUID();

            const { error: productError } = await adminClient.from('products').insert({
                id: productId,
                title: productData.title,
                category: productData.category,
                quantity: productData.quantity || 1,
                value: productData.value || 0,
                serial_number: productData.serialNumber,
                asset_type: productData.assetType || 'PERMANENT',
                status: 'ASSIGNED',
                assigned_to_id: employeeId,
                assigned_to_name: employee.name,
                image_url: `https://placehold.co/600x400/EEE/31343C.png?font=montserrat&text=${encodeURIComponent(productData.title)}`
            });

            if (productError) throw productError;

            // Log Product Creation (Legacy Import)
            await adminClient.from('history_logs').insert({
                product_id: productId,
                action: 'CREATED',
                employee_id: employeeId,
                employee_name: employee.name, // "Admin" or Employee? "Item já está com Fulano"
                transaction_id: transactionId,
                date: new Date().toISOString()
            });
        }

        // 3. Register Contract
        const { error: contractError } = await adminClient
            .from('signed_contracts')
            .insert({
                employee_id: employeeId,
                product_id: productId, // Link to the new item
                type: 'LEGACY',
                file_url: publicUrl,
                status: isSigned ? 'VERIFIED' : 'PENDING_SIGNATURE'
            });

        if (contractError) throw contractError;

        // 4. Log Contract History
        await adminClient.from('history_logs').insert({
            action: 'ASSIGNED', // "Legacy Assignment"
            product_id: productId, // Link log to product
            employee_id: employeeId,
            employee_name: employee.name,
            transaction_id: transactionId,
            date: new Date().toISOString()
        });

        return { success: true, message: "Contrato e Item importados com sucesso!", url: publicUrl };

    } catch (error: any) {
        console.error("Legacy Upload Error:", error);
        return { success: false, message: error.message || "Erro ao importar contrato." };
    }
}

export async function deleteContractAction(contractId: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, message: "Erro de configuração do servidor." };
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // 1. Fetch details for Cleanup and Logging
        const { data: contract, error: fetchError } = await adminClient
            .from('signed_contracts')
            .select('*, employees(name)')
            .eq('id', contractId)
            .single();

        if (fetchError || !contract) throw new Error("Contrato não encontrado.");

        // 2. Delete from Storage
        if (contract.file_url) {
            try {
                // Extract path from URL: .../contracts/filename...
                // URL format: https://.../storage/v1/object/public/contracts/folder/file.pdf
                // We need 'folder/file.pdf' or just 'file.pdf' depending on bucket root.
                // Our upload saves to `contracts/${fileName}` or `contracts/legacy/${fileName}` inside 'contracts' bucket.
                // The public URL usually ends with the path.
                // Reliable way is to remove the domain prefix.
                // Or just try to parse the last segments.
                const url = new URL(contract.file_url);
                const pathParts = url.pathname.split('/contracts/'); // Split by bucket name
                if (pathParts.length > 1) {
                    const filePath = pathParts[1]; // "legacy/file.pdf"
                    await adminClient.storage.from('contracts').remove([filePath]);
                }
            } catch (err) {
                console.warn("Could not delete file from storage, proceeding with record deletion.", err);
            }
        }

        // 3. Delete Record
        const { error: deleteError } = await adminClient
            .from('signed_contracts')
            .delete()
            .eq('id', contractId);

        if (deleteError) throw deleteError;

        // 4. Log History
        await adminClient.from('history_logs').insert({
            action: 'CONTRACT_DELETED',
            employee_id: contract.employee_id,
            employee_name: contract.employees?.name || 'Funcionário',
            transaction_id: `DEL-${contractId.slice(0, 8)}`,
            date: new Date().toISOString()
        });

        return { success: true, message: "Contrato excluído com sucesso." };

    } catch (error: any) {
        console.error("Delete Contract Error:", error);
        return { success: false, message: error.message || "Erro ao excluir contrato." };
    }
}
