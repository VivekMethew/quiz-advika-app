const path = require("path");
const fileD = require("./parseExcel");

const filePath = path.join(
  __dirname,
  "../public",
  "upload",
  "1751742957797-games.xlsx"
);
console.log({ filePath });

const quizData = fileD.parseQuizExcel(filePath);
console.log(quizData[0]);
