import express, { Application } from "express";
import cors from "cors";

const app: Application = express();

app.use(cors({ origin: true }));
app.use(express.json());

export default app;
