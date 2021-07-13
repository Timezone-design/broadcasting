const rtcPeerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};
const videoElement = document.querySelector("video");
const socket = io.connect(window.location.origin);
 

document.getElementById("start").onclick = function () {
  var room_number = document.getElementById("room").value;
  if (room_number === ""|| room_number == "") {
    alert("Please type a room number!");
  } else {
    user = {
      room: room_number,
    };
    videoElement.style ="display:block;";

    navigator.mediaDevices
      .getUserMedia({video:true, audio:true})
      .then(function (stream) {
        videoElement.srcObject = stream;
        socket.emit("broadcaster", user.room);
        console.log(user.room, 1);
      })
      .catch(function (err) {
        console.log("An error ocurred when accessing media devices", err);
      });
}}

socket.on("newViewer", function (viewer) {
  const rtcPeerConnection = new RTCPeerConnection(config);
  rtcPeerConnections[viewer.id] = rtcPeerConnection;
  const stream = videoElement.srcObject;
  stream
    .getTracks()
    .forEach((track) => rtcPeerConnections[viewer.id].addTrack(track, stream));
  rtcPeerConnections[viewer.id].onicecandidate = (event) => {
    if (event.candidate) {
      console.log("sending ice candidate");
      socket.emit("candidate", viewer.id, {
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    }
  };

  rtcPeerConnections[viewer.id]
    .createOffer()
    .then((sessionDescription) => {
      rtcPeerConnections[viewer.id].setLocalDescription(sessionDescription);
      socket.emit("offer", viewer.id, {
        type: "offer",
        sdp: sessionDescription,
        broadcaster: user,
      });
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(user, 10);
});

socket.on("answer", function (viewerId, event) {
  console.log(viewerId, 20);
  rtcPeerConnections[viewerId].setRemoteDescription(
    new RTCSessionDescription(event)
  );
});

socket.on("candidate", function (id, event) {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });
  rtcPeerConnections[id].addIceCandidate(candidate);
});






// const socket = io.connect(window.location.origin);

// socket.on("answer", (id, description) => {
//   peerConnections[id].setRemoteDescription(description);
// });

// socket.on("watcher", id => {
//   const peerConnection = new RTCPeerConnection(config);
//   peerConnections[id] = peerConnection;

//   let stream = videoElement.srcObject;
//   stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

//   peerConnection.onicecandidate = event => {
//     if (event.candidate) {
//       socket.emit("candidate", id, event.candidate);
//     }
//   };

//   peerConnection
//     .createOffer()
//     .then(sdp => peerConnection.setLocalDescription(sdp))
//     .then(() => {
//       socket.emit("offer", id, peerConnection.localDescription);
//     });
// });

// socket.on("candidate", (id, candidate) => {
//   peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
// });

// socket.on("disconnectPeer", id => {
//   peerConnections[id].close();
//   delete peerConnections[id];
// });

// window.onunload = window.onbeforeunload = () => {
//   socket.close();
// };


// }}

// // Get camera and microphone



// function getStream() {
//   if (window.stream) {
//     window.stream.getTracks().forEach(track => {
//       track.stop();
//     });
//   }
//   const audioSource = audioSelect.value;
//   const videoSource = videoSelect.value;
//   const constraints = {
//     audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
//     video: { deviceId: videoSource ? { exact: videoSource } : undefined }
//   };
//   return navigator.mediaDevices
//     .getUserMedia(constraints)
//     .then(gotStream)
//     .catch(handleError);
// }

// function gotStream(stream) {
//   window.stream = stream;
//   audioSelect.selectedIndex = [...audioSelect.options].findIndex(
//     option => option.text === stream.getAudioTracks()[0].label
//   );
//   videoSelect.selectedIndex = [...videoSelect.options].findIndex(
//     option => option.text === stream.getVideoTracks()[0].label
//   );
//   videoElement.srcObject = stream;
//   socket.emit("broadcaster");
// }

// function handleError(error) {
//   console.error("Error: ", error);
// }

