const rtcPeerConnections = {};
const config = {
  iceServers: [
      { 
        "urls": "stun:stun.l.google.com:19302",
      },
      // { 
      //   "urls": "turn:TURN_IP?transport=tcp",
      //   "username": "TURN_USERNAME",
      //   "credential": "TURN_CREDENTIALS"
      // }
  ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");

document.getElementById("start").onclick = function () {
  var room_number = document.getElementById("room").value;
  if (room_number === ""|| room_number == "") {
    alert("Please type a room number!");
  } else {
    user = {
      room: room_number,
     
    };
    console.log(user.room, 4);

socket.emit("viewer", user);
console.log(user, 5);
}}


socket.on("offer", function (broadcaster, sdp) {
  
  console.log(user, 14);
  const peerConnetion = new RTCPeerConnection(config);
 rtcPeerConnections[broadcaster.id] = peerConnetion;

  rtcPeerConnections[broadcaster.id].setRemoteDescription(sdp);

  rtcPeerConnections[broadcaster.id]
    .createAnswer()
    .then((sessionDescription) => {
      rtcPeerConnections[broadcaster.id].setLocalDescription(
        sessionDescription
      );
      console.log(broadcaster.id, 15);
      socket.emit("answer", {
        type: "answer",
        sdp: sessionDescription,
        room: user.room,
      });
      console.log(user.room, 16);
    });

    console.log(user.room, 17);
  rtcPeerConnections[broadcaster.id].ontrack = (event) => {
    video.srcObject = event.streams[0];
    console.log(user.room, 18);
  };

  rtcPeerConnections[broadcaster.id].onicecandidate = (event) => {
    if (event.candidate) {
      console.log("sending ice candidate");
      socket.emit("candidate", broadcaster.id, {
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    }
  };
});
  
socket.on("candidate", function (id, event) {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });
  rtcPeerConnections[id].addIceCandidate(candidate);
});

socket.on("empty", function (error) {
  console.log("empty");
  document.getElementById("error").innerHTML = error;
  video.style.display ="none";
});

socket.on("exist", function(){
  video.style.display ="block";
  document.getElementById("error").innerHTML = "";
});
  

  
  
  
  
  

// socket.on("offer", (id, description) => {
//   peerConnection = new RTCPeerConnection(config);
//   peerConnection
//     .setRemoteDescription(description)
//     .then(() => peerConnection.createAnswer())
//     .then(sdp => peerConnection.setLocalDescription(sdp))
//     .then(() => {
//       socket.emit("answer", id, peerConnection.localDescription);
//     });
//   peerConnection.ontrack = event => {
//     video.srcObject = event.streams[0];
//   };
//   peerConnection.onicecandidate = event => {
//     if (event.candidate) {
//       socket.emit("candidate", id, event.candidate);
//     }
//   };
// });


// socket.on("candidate", (id, candidate) => {
//   peerConnection
//     .addIceCandidate(new RTCIceCandidate(candidate))
//     .catch(e => console.error(e));
// });

// socket.on("broadcaster", () => {
//   socket.emit("watcher");
// });

// window.onunload = window.onbeforeunload = () => {
//   socket.close();
//   peerConnection.close();
// };
