import type { ContextItem } from "../types.js";

export function enforceTokenBudget(items: ContextItem[], maxTokens: number) {
    items.sort((a,b) => b.relevanceScore - a.relevanceScore);

    const finalItems: ContextItem[] = [];
    
    let tokenSum = 0; 
    for(const item of items) {
        if(item.tokenCount + tokenSum <= maxTokens) {
            finalItems.push(item);
            tokenSum += item.tokenCount;
        }
    }

    return {
        finalItems,
        totalTokensConsumed: tokenSum
    }
}