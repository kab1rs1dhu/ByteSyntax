import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_API_SECRET: process.env.STREAM_API_SECRET,
    INGEST_EVENT_KEY: process.env.INGEST_EVENT_KEY,
    INGEST_SIGNING_KEY: process.env.INGEST_SIGNING_KEY,
};  