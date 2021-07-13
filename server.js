const express = require("express");
const app = express();

var  broadcaster=[];
const port = process.env.PORT || 3000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", function (room) {
    broadcaster[room] = socket.id;
    console.log(broadcaster[room], 2);
    socket.join(room);
    console.log(room, 3);
 });
  
  socket.on("viewer", function(user){
    console.log(user.room, 6);
    user.id = socket.id;
    console.log(user.id, 7);
    if (!broadcaster[user.room]) {
      console.log(100);
      errorMessage = "No stream in this room";
      socket.emit("empty", errorMessage);
    }
    else{
      socket.emit("exist");
      socket.join(user.room);
      socket.to(broadcaster[user.room]).emit("newViewer", user);
      console.log(broadcaster[user.room], 8);
    }
  });
  
  socket.on("candidate", function (id, event) {
    socket.to(id).emit("candidate", socket.id, event);
});

socket.on("offer", function (id, event) {
    console.log(11);
    event.broadcaster.id = socket.id;
    console.log(event.broadcaster.id, 12);
    
    socket.to(id).emit("offer", event.broadcaster, event.sdp);
    console.log(id, 13);
});

socket.on("answer", function (event) {
  console.log(19);
  socket.to(broadcaster[event.room]).emit("answer", socket.id, event.sdp);
  console.log(broadcaster[event.room], 20);
  console.log(socket.id, 21);
});

//   socket.on("watcher", () => {
//     socket.to(broadcaster).emit("watcher", socket.id);
//   });
//   socket.on("offer", (id, message) => {
//     socket.to(id).emit("offer", socket.id, message);
//   });
//   socket.on("answer", (id, message) => {
//     socket.to(id).emit("answer", socket.id, message);
//   });
//   socket.on("candidate", (id, message) => {
//     socket.to(id).emit("candidate", socket.id, message);
//   });
//   socket.on("disconnect", () => {
//     socket.to(broadcaster).emit("disconnectPeer", socket.id);
//   });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
