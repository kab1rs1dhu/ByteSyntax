import { generateStreamToken } from "../config/stream.js";

export const getStreamToken = async (req, res) => {
    try {
        const token = generateStreamToken(req.auth().userId);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error generating stream token:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
