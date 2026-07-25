import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv";

import exampleRoutes from "./routes/example";
import { init as initSocket } from "./socket";

dotenv.config();

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, "img_" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(
  cors({
    origin: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

app.use("/example", exampleRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const mongodbUrl = process.env.MONGODB_URL || "";

if (mongodbUrl) {
  mongoose
    .connect(mongodbUrl)
    .then(() => {
      const server = app.listen(8081);
      const io = initSocket(server);
      io.on("connection", (socket) => {
        console.log(`New connection: ${socket.id}`);
        socket.on("disconnect", (reason) => {
          console.log(`Close connection: ${reason}`);
        });
      });
    })
    .catch((err) => console.log(err));
}

export default app;
