// import axios from "axios"
const axios = require("axios");
const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
let sidMap = new Map();
io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  socket.on("sendSocketID", (data) => {
    axios.post("http://localhost:5173/api/user/setsocketid", {
      phoneNumber: data.phoneNumber,
      socketID: data.socketID,
    });
    sidMap.set(socket.id, data.phoneNumber);
  });

  socket.on("sendMessage", (data) => {
    socket.to(data.receiver).emit("recieveMessage", data);
    console.log(data, "recieved");
  });

  socket.on("deleteMessage", (data) => {
    socket.to(data.receiver).emit("deleteReceiveMessage",data)
  })

  // socket.on("disconnect", () => {
  //   navigator.sendBeacon("http://localhost:5173/api/user/setoffline", {
  //     phoneNumber: sidMap.get(socket.id)
  //   })
  //   axios.post("http://localhost:5173/api/user/setoffline", {
  //     phoneNumber: sidMap.get(socket.id),
  //   });
  //   console.log("User Disconnected", socket.id);
  // });
  socket.on("disconnect", async () => {
    const phoneNumber = sidMap.get(socket.id);

    try {
      await axios.post("http://localhost:5173/api/user/setoffline", {
        phoneNumber: phoneNumber,
      });
      console.log("User Disconnected", socket.id);
    } catch (error) {
      console.error("Error setting user offline:");
    }

    // Remove the socket id from the map after disconnect
    sidMap.delete(socket.id);
  });
});
