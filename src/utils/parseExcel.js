const XLSX = require("xlsx");

exports.parseQuizExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const quizSheet = workbook.Sheets[workbook.SheetNames[0]];
  const questionSheet = workbook.Sheets[workbook.SheetNames[1]];
  const rows = XLSX.utils.sheet_to_json(quizSheet);

  const quizz = rows.map((row) => {
    const questions = XLSX.utils
      .sheet_to_json(questionSheet)
      .filter((item) => item.ID === row.ID);

    const mapQuestions = questions.map((ques) => {
      return {
        title: ques.Title,
        type: "quiz",
        optionType: ques.Type.toLowerCase(),
        duration: ques.Duration,
        point: ques.Point,
        options: [ques.A, ques.B, ques.C, ques.D],
        answers: [ques.Answers],
      };
    });
    return {
      title: row.Title,
      type: row.Type,
      description: row.Description,
      duration: row.Duration,
      questions: mapQuestions,
    };
  });

  return quizz;
};
