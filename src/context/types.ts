export interface ContextItem {
    id: string;
    source: 'state' | 'memory' | 'knowledge' | 'tool';
    content: string;
    metadata: Record<string, any>;
    relevanceScore: number;
    tokenCount: number;
};

export interface ContextPacket {
    taskId: string;
    agentRole: string;
    systemDirectives: string[];
    executionState: Record<string, any>;
    workingMemory: ContextItem[];
    knowledgeBase: ContextItem[];
    totalTokens: number;
};

