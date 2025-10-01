import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { inngest, functions } from "./config/inngest.js"; 
import { serve } from "inngest/express";

const app = express();

app.use(express.json());
app.use(clerkMiddleware()) // we need this to check if user is authenticated or not

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});


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