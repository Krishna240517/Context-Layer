import MemoryClient from "mem0ai";
import { env } from "../env";

const client = new MemoryClient({
    apiKey: env.MEMO_KEY!
});

export default client;