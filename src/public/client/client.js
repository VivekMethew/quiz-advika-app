/**
 * @SOCKET connection
 */
const socket = io();

const moderator_join = document.querySelector("#moderator_join");
const player_give_answer = document.querySelector("#player_give_answer");

socket.on("participants", (data) => {
  console.log("***************participants ***********************");
  console.log(data);
  console.log("***************END participants***********************");
});

socket.on("mode_message", (data) => {
  console.log("***************mode_message ***********************");
  console.log(data);
  console.log("***************END mode_message***********************");
});

socket.on("roomData", (data) => {
  console.log("***************roomData ***********************");
  console.log(data);
  console.log("***************END roomData***********************");
});

socket.on("p_message", (data) => {
  console.log("***************p_message ***********************");
  console.log(data);
  console.log("***************END p_message***********************");
});

socket.on("playerRoomData", (data) => {
  console.log("***************playerRoomData ***********************");
  console.log(data);
  console.log("***************END playerRoomData***********************");
});

socket.on("gameDetail", (data) => {
  console.log("***************gameDetail ***********************");
  console.log(data);
  console.log("***************END gameDetail***********************");
});

socket.on("scoreboard", (data) => {
  console.log("***************scoreboard ***********************");
  console.log(data);
  console.log("***************END scoreboard***********************");
});

moderator_join.addEventListener("submit", (e) => {
  e.preventDefault();

  let options = {
    room: e.target.elements.room.value, // "moderator"/"player"
    userId: e.target.elements.userId.value, // userID must be string
    roomCode: e.target.elements.roomCode.value, // 111500
  };

  console.log(options);

  if (options.room === "player") {
    socket.emit("p_join", options, (error, data) => {
      if (error) console.log(error);
      console.log(data);
    });
  } else {
    socket.emit("moderator_join", options, (error, data) => {
      if (error) console.log(error);
      console.log(data);
    });
  }
});

// give // give_answers
player_give_answer.addEventListener("submit", (e) => {
  e.preventDefault();
  let options = {
    type: "quiz",
    userId: e.target.elements.userId.value,
    roomCode: e.target.elements.roomCode.value,
    quesId: e.target.elements.quesId.value, // "645cbe725f90815928f04c52", //645208dc0e07a375c8f6c99f
    answers: Array.from(e.target.elements.answers.selectedOptions).map(
      (option) => option.value
    ),
    answerTime: 20,
  };

  console.log("options", options);

  socket.emit("give_answers", options, (error, data) => {
    if (error) console.log(error);
    console.log(data);
  });
});
