const winstonLog = require("./winstonLog");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_ESKOOPS,
});

/* original*/
// exports.createQuestions = async (topic, noOfQues, currentQuestions = []) => {
//   try {
//     console.log("Number of questions generated so far:", currentQuestions.length);
//     // Calculate the remaining number of questions needed
//     const remainingQuestions = noOfQues - currentQuestions.length;
//     // If enough questions has been generated, return the current set
//     if (remainingQuestions <= 0) {
//       //return currentQuestions.slice(0, noOfQues);
//       return { status:true,questions:currentQuestions.slice(0, noOfQues) };
//     }
//     // Construct the prompt for generating questions
//     const prompt = `write ${remainingQuestions} quiz about "${topic}"
//     Output must be in format:
//     Question: Which river is considered the holiest in India?
//     Choices:
//     a) Ganges
//     b) Yamuna
//     c) Brahmaputra
//     d) Godavari
//     Answer: a) Ganges`;
//     // Call OpenAI API for chat completions
//     const chatCompletion = await openai.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: process.env.GPT_MODEL,
//     });
//     // Extract and format the generated question
//     const newQuestion = this.createFormatQuestionResp(
//       chatCompletion.choices[0].message.content
//     );
//     // Log the generated question
//     winstonLog.info(chatCompletion.choices[0].message.content);
//     // Combine the new question with the current set of questions
//     const allGeneratedQuestions = currentQuestions.concat(newQuestion);
//     // Recursively call the function with the updated set of questions
//     return this.createQuestions(topic, noOfQues, allGeneratedQuestions);
//   } catch (error) {
//     console.error("Error generating MCQs:", error);
//     //throw new Error("Something went wrong while generating MCQs.");
//     return { status:false,error:error};
//   }
// };

exports.createQuestions = async (topic, noOfQues,currentQuestions = []) => {
  try {
    const remainingQuestions = noOfQues - currentQuestions.length;
    if (remainingQuestions <= 0) {
      return { status:true,questions:currentQuestions.slice(0, noOfQues) };
    }
    const prompt = `Generate ${remainingQuestions} questions about "${topic}" with
    options and correct answers.
    Please provide the title, options, and answers in array format.
    Ensure key is "questions" and that each question object follows the structure:
    {
      "title": "Question text",
      "options": ["Option 1", "Option 2", ..., "Option N"],
      "answers": [index_of_correct_answer]
    }`;
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON.",
        },
        { role: "user", content: prompt },
      ],
      model: process.env.GPT_MODEL,
      response_format: { type: "json_object" }
    });
    const originalData = chatCompletion.choices[0].message.content;
    winstonLog.info(chatCompletion.choices[0].message.content);
    
    const responseData = JSON.parse(originalData);
    
  
    let validateData = validateQuizJson(responseData);
    if (validateData) {
      
      var allQuestions = currentQuestions.concat(responseData.questions);
      return exports.createQuestions(topic, noOfQues, allQuestions);
    }
    else {
      return { status:false,error:'Validation error'};
    }
   
  } catch (error) {
    console.error("Error generating MCQs:", error);
    return { status:false,error:'Unexpected end of JSON input'};
  }
};

function validateQuizJson(data) {
  try {
     
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          return false;
      }
      for (const question of data.questions) {
          
          if (typeof question.title !== 'string' || question.title.trim() === '') {
              return false;
          }
          
          if (!Array.isArray(question.options) ||
              question.options.length === 0 ||
              !question.options.every(option => typeof option === 'string' && option.trim() !== '')) {
              return false;
          }
          
          if (!Array.isArray(question.answers) ||
              question.answers.length === 0 ||
              !question.answers.every(answer => typeof answer === 'number')) {
              return false;
          }
      }
      return true;
  } catch (e) {
      return false;
  }
}
// Create Poll
exports.createPoll = async (topic, noOfQues, currentQuestions = []) => {
  try {
    const remainingQuestions = noOfQues - currentQuestions.length;
    if (remainingQuestions <= 0) {
      return { status:true,questions:currentQuestions.slice(0, noOfQues) };
    }
    const prompt = `Generate ${remainingQuestions} questions about "${topic}" with
    options.
    Please provide the title, option in array format.
    Ensure key is "questions" and that each question object follows the structure:
    {
      "title": "Question text",
      "options": ["Option 1", "Option 2", ..., "Option N"]
    }`;
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to output JSON.",
        },
        { role: "user", content: prompt },
      ],
      model: process.env.GPT_MODEL,
      response_format: { type: "json_object" }
    });
    const originalData = chatCompletion.choices[0].message.content;
    winstonLog.info(originalData);
    
    const responseData = JSON.parse(originalData);
    
  
    let validateData = validatePollJson(responseData);
    if (validateData) {
      
      var allQuestions = currentQuestions.concat(responseData.questions);
      return exports.createQuestions(topic, noOfQues, allQuestions);
    }
    else {
      return { status:false,error:"Validation error"};
    }
   
  } catch (error) {
    //console.error("Error generating MCQs:", error);
    return { status:false,error:'Unexpected end of JSON input'};
  }
};
function validatePollJson(data) {
  try {
     
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          return false;
      }
      for (const question of data.questions) {
          
          if (typeof question.title !== 'string' || question.title.trim() === '') {
              return false;
          }
          
          if (!Array.isArray(question.options) ||
              question.options.length === 0 ||
              !question.options.every(option => typeof option === 'string' && option.trim() !== '')) {
              return false;
          }
          
          
      }
      return true;
  } catch (e) {
      return false;
  }
}
exports.createFormatQuestionResp = (response) => {
  const quizs = new Map();
  const newArr = response.split("\n\n");
  newArr.map((obj, index) => {
    if (obj.length > 0) {
      const quesObj = obj.split("\n").filter((element) => /\S/.test(element));
      const len = quesObj.length;
      if (len >= 7) {
        quizs.set(index, {
          title: quesObj[0].split(/[:.]/)[1]?.trim() || "",
          options: [],
          answers: [],
          isCreatedByChatgpt: true,
        });
        for (let j = 2; j < len - 1; j++) {
          quizs
            .get(index)
            .options.push(quesObj[j]?.split(")")[1]?.trim() || "");
        }
        const findIndex = quizs
          .get(index)
          .options.findIndex(
            (elem) => elem === quesObj[len - 1]?.split(")")[1]?.trim()
          );
        if (findIndex !== -1) {
          quizs.get(index).answers.push(findIndex);
        }
      }
    }
  });
  return Array.from(quizs.values());
};
//poll
exports.createFormatPollResp = (response) => {
  const formattedQuestions = [];
  const lines = response.data
    .split("\n")
    .filter((element) => /\S/.test(element));
  const numLines = lines.length;
  let currentQuestion = null;
  let currentOptions = [];
  let isParsingOptions = false;
  for (let i = 0; i < numLines; i++) {
    const line = lines[i].trim();
    if (line.match(/^\d+\.\s/)) {
      if (currentQuestion) {
        currentQuestion.options = currentOptions.slice();
        formattedQuestions.push(currentQuestion);
      }
      const questionText = line.replace(/^\d+\.\s/, "").trim();
      currentQuestion = {
        title: questionText,
        options: [],
        isCreatedByChatgpt: true,
      };
      currentOptions = [];
      isParsingOptions = true;
    } else if (isParsingOptions) {
      if (line.match(/^[a-d]\)\s+/i)) {
        const optionText = line.split(/\)\s+/)[1]?.trim() || "";
        currentOptions.push(optionText);
      } else if (!line.startsWith("com ")) {
        isParsingOptions = false;
        i--;
      }
    }
  }
  if (currentQuestion) {
    currentQuestion.options = currentOptions.slice();
    formattedQuestions.push(currentQuestion);
  }
  return formattedQuestions;
};