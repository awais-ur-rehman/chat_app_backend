const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const Message = require("./models/Messages"); // Import Message model
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);

  socket.on("joinRoom", ({ userName, chatPartnerName }) => {
    const room = [userName, chatPartnerName].sort().join("_");
    socket.join(room);
  });

  socket.on("sendMessage", async (data) => {
    const message = new Message({
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
    });

    await message.save();
    const room = [data.sender, data.receiver].sort().join("_");
    io.to(room).emit("receiveMessage", data);
  });

  socket.on("fetchMessages", async (data, callback) => {
    const messages = await Message.find({
      $or: [
        { sender: data.user, receiver: data.chatPartner },
        { sender: data.chatPartner, receiver: data.user },
      ],
    }).sort("timestamp");
    callback(messages);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
