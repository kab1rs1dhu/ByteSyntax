import "../instrument.mjs";
import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";

import cors from "cors";

import * as Sentry from "@sentry/node";



const app = express();

app.use(express.json());
app.use(cors({
    origin: ENV.CLIENT_URL, // frontend url
    credentials: true,
}));
// Ensure requests carry Clerk auth context for downstream route handlers.
app.use(clerkMiddleware()); // we need this to check if user is authenticated or not

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

// Register Sentry after routes so it can capture downstream errors gracefully.
Sentry.setupExpressErrorHandler(app);


const startServer = async () => {
    try {
        await connectDB();
        if (ENV.NODE_ENV !== "production") {
            app.listen(ENV.PORT, () => {
                console.log(`Server is running on port ${ENV.PORT}`);
            });
        }

    } catch (error) {
        console.error("Error starting server:", error);

    }
};

startServer();

export default app; 
