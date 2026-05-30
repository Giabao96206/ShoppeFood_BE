import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import routes from "./routers/index.routers";
import path from "path";
const Redis = require('ioredis');
import http from "http";
import { initializeSocket } from "./socket";

dotenv.config();
const app = express();

const server = http.createServer(app);
// init socket
initializeSocket(server);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

app.use(
  "/images",
  express.static(
    path.join(__dirname, "../src/images")
  )
);

routes(app);

const PORT =
  process.env.PORT || 5000;

connectDB().then(() => {
  // QUAN TRỌNG:
  server.listen(PORT, () => {
    console.log(
      `🚀 Server running at http://localhost:${PORT}`
    );
  });

});