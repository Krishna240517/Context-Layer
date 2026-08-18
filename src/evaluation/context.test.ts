import { test, expect } from "bun:test";
import { ContextManager } from "../context/ContextManager";
import type { ContextItem } from "../context/types";
import { enforceTokenBudget } from "../context/selectors/budget";



test("Planner policy strictly isolates context", async () => {
    const manager = new ContextManager();


    const rawState = {
        taskId: "task-001",
        research_question: "How to optimize vector search?",
        supervisor_directives: "Prioritize recent papers.",
        gathered_evidence: ["Massive array of Qdrant data..."], // MUST BE BLOCKED
        analyst_scratchpad: "The data suggests..."
    }

    const packet = await manager.buildContext('planner', rawState);

    // 1. Assert the allowed keys are present
    expect(packet.executionState.research_question).toBeDefined();
    expect(packet.executionState.supervisor_directives).toBeDefined();

    // 2. Assert the unauthorized keys are completely undefined (The True Isolation Test)
    expect(packet.executionState.gathered_evidence).toBeUndefined();
    expect(packet.executionState.analyst_scratchpad).toBeUndefined();
})

test("Token budget strict limit enforcement", () => {
    // Create an array of mock items totaling 8,500 tokens
    const mockItems: ContextItem[] = [
        { id: "1", source: "knowledge", content: "Data A", metadata: {}, relevanceScore: 0.9, tokenCount: 3000 },
        { id: "2", source: "knowledge", content: "Data B", metadata: {}, relevanceScore: 0.8, tokenCount: 2500 },
        { id: "3", source: "memory", content: "Data C", metadata: {}, relevanceScore: 0.7, tokenCount: 3000 }
    ];

    // Enforce a strict limit of 4000 tokens
    const MAX_BUDGET = 4000;
    const { finalItems, totalTokensConsumed } = enforceTokenBudget(mockItems, MAX_BUDGET);

    // 1. Assert that the total tokens consumed does not exceed the budget
    expect(totalTokensConsumed).toBeLessThanOrEqual(MAX_BUDGET);

    // 2. Assert that we actually dropped the items that wouldn't fit
    // Item 1 (3000) fits. Item 2 (2500) would make it 5500 (rejected). Item 3 (3000) would make it 6000 (rejected).
    expect(finalItems.length).toBe(1);
    expect(finalItems[0].id).toBe("1");
});