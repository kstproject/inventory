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
                timestamp: new Date().toISOString()
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
