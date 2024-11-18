import e from "express";
import { userRoutes } from "./routes/userRoutes.js";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import { carRoutes } from "./routes/carRoutes.js";

export const app = e();

dotenv.config({ path: ".env" });

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  session({
    cookie: { sameSite: true },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `${process.env.MONGODB_URI}`.replace(
        "<password>",
        process.env.MONGODB_PASSWORD
      ),
      dbName: process.env.MONGODB_NAME,
      collectionName: "session",
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "interval",
      autoRemoveInterval: 10,
    }),
  })
);

app.use(helmet());

app.set("trust proxy", 1);

app.use(morgan("dev"));

app.use(bodyParser.json({ limit: "20480kb" }));
app.use(bodyParser.urlencoded({ limit: "20480kb", extended: true }));

app.use("/api", userRoutes);
app.use("/api", carRoutes);
