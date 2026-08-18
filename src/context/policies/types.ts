export interface ContextPolicy {
    allowedStateKeys: string[];
    requiresWorkingMemory: boolean;
    requiresKnowledgeBase: boolean;
};


export const plannerPolicy : ContextPolicy = {
    allowedStateKeys: ['research_question','supervisor_directives'],
    requiresWorkingMemory: true,
    requiresKnowledgeBase: false
}


export const researcherPolicy: ContextPolicy = {
    allowedStateKeys: ['current_task','research_plan'],
    requiresWorkingMemory: false,
    requiresKnowledgeBase: true
};