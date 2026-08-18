import dotenv from "dotenv";
dotenv.config({path:"../.env"});
export const env = {
    AI_URL: process.env.OPENROUTER_API_KEY!,
    DB_URL: process.env.DATABASE_URL!,
    MEMO_KEY: process.env.MEMO_KEY!,
    GEMINI_KEY: process.env.GEMINI_KEY!
}
