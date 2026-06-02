import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client Connected:", socket.id);

  socket.on("job-progress", (data) => {
    console.log(
"Broadcasting Progress:",
data
);

    io.emit("job-progress", data);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Socket Server Running");
});

const PORT=
process.env.PORT || 4000;

server.listen(PORT, () => {
console.log(
`Socket Server running on port ${PORT}`
);
});