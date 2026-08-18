import { ChatOpenRouter } from "@langchain/openrouter";
import type { ContextItem } from "./types.js";
import { env } from "../env.js";


export async function compressContextItem(item: ContextItem, targetTokens: number): Promise<ContextItem> {
    if (item.tokenCount <= targetTokens) return item;

    const model = new ChatOpenRouter({
        apiKey: env.AI_URL, 
        model: "openai/gpt-4o"
    });

    const systemPrompt = `You are a strict context compression engine. Extract only the core factual claims and data points from the following text. Do not add conversational filler. Keep the output under ${targetTokens} tokens.`;

    try {
        const response = await model.invoke([
            { role: "system", content: systemPrompt },
            { role: "user", content: item.content }
        ]);

        return {
            ...item,
            content: String(response.content),
            tokenCount: targetTokens 
        };
    } catch (error) {
        console.error(`Failed to compress context item ${item.id}:`, error);
        return item; 
    }
}