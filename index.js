import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import aiRoutes from "./Routes/mcqs.routes.js";

dotenv.config();

const app = express();
const port = 3000;

// enable CORS for Angular app
app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://mytestseries.netlify.app"
  ]
}));
// optional (for JSON body from Angular forms)
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});