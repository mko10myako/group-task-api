import express from "express";
import authRoutes from "./routes/auth.route.js";
import groupRoutes from "./routes/group.route.js";

const app = express();

// Allows the API to read JSON request bodies
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/groups", groupRoutes);



// Root test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Group Task API is running.",
  });
});

export default app;