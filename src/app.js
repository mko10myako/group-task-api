import express from "express";

const app = express();

// Allows the API to read JSON request bodies
app.use(express.json());

// Root test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Group Task API is running.",
  });
});

export default app;