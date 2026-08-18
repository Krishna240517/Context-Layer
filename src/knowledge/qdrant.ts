import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "../env";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: env.GEMINI_KEY
});

const COLLECTION_NAME = "research_collection";


const qdrantclient = new QdrantClient({
    host:"172.22.64.1",
    port:6333
});


export async function retrieveEvidence(query: string) {
    try {
        const queryVector = await embeddings.embedQuery(query);

        const results = await qdrantclient.query(COLLECTION_NAME,{
            query: queryVector,
            limit: 5,
            with_payload: true
        });

        return results.points;
    } catch (err) {
        console.error("Qdrant retrieval failed:", err);
        return [];
    }
}

export default qdrantclient;