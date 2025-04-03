import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());

//import routes
import userRouter from "./routes/user.route.js";

// routes declaration
// app.use("/api/v1/auths", authRouter);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/products", productRouter);

export default app;
