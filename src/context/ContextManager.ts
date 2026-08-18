import client from "../memory/mem0.js";
import qdrantclient, { retrieveEvidence } from "../knowledge/qdrant.js";
import { plannerPolicy, researcherPolicy, type ContextPolicy } from "./policies/types.js";
import type {ContextItem, ContextPacket } from "./types.js";
import { enforceTokenBudget } from "./selectors/budget.js";

export class ContextManager {


    async buildContext(agentRole: string, rawState: any): Promise<ContextPacket> {
        let policy: ContextPolicy | null = null;
        if(agentRole === 'planner') {
            policy = plannerPolicy;
        } else if(agentRole === 'researcher') {
            policy = researcherPolicy
        }

        if(!policy) throw new Error(`No context policy found for ${agentRole}`);

        const filteredState: Record<string, any> = {};

        for(const key of policy.allowedStateKeys) {
            if(key in  rawState) {
                filteredState[key] = rawState[key];
            }
        }

        const semanticTrigger = filteredState.research_question || filteredState.current_task || "general inquiry";

        let workingMemory: ContextItem[] = [];

        if(policy.requiresWorkingMemory) {
            const query = filteredState.research_question || "general user preferences";

            try {
                const memories = await client.search(query,{filters:{user_id: "default_user"}});

                workingMemory = memories.results.map((mem: any, index: number) => ({
                    id: mem.id || `mem-${index}`,
                    source: 'memory',
                    content: mem.memory || mem.text || JSON.stringify(mem), 
                    metadata: mem.metadata || {},
                    relevanceScore: mem.score || 1.0,
                    tokenCount: Math.ceil((mem.memory?.length || 50) / 4)
                }))
            } catch(err) {
                console.error("Mem0 retrieval failed:", err);
            }
        }

        let knowledgeBase: ContextItem[] = [];

        if(policy.requiresKnowledgeBase) {
            try {
                const evidence = await retrieveEvidence(semanticTrigger);


                knowledgeBase = evidence.map((doc: any, index: number) => ({
                    id: String(doc.id || `doc-${index}`),
                    source:'knowledge',
                    content: doc.payload?.text || JSON.stringify(doc.payload),
                    metadata: doc.payload || {},
                    relevanceScore: doc.score || 1.0,
                    tokenCount: Math.ceil((doc.payload?.text?.length || 100) / 4)
                }));
            } catch (err) {
                console.error("Knowledge retrieval failed: ",err);
            }
        }

        const combinedArray = [...workingMemory,...knowledgeBase];
        const { finalItems, totalTokensConsumed } = enforceTokenBudget(combinedArray, 4000);

        const finalWorkingMemory = finalItems.filter(item => item.source === 'memory');
        const finalKnowledgeBase = finalItems.filter(item => item.source === 'knowledge');


        return {
            taskId: rawState.taskId || 'unknown_task',
            agentRole,
            systemDirectives:[],
            executionState: filteredState,
            workingMemory: finalWorkingMemory,
            knowledgeBase: finalKnowledgeBase,
            totalTokens: totalTokensConsumed
        }
    }
}