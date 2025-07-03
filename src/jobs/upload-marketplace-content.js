require("dotenv").config();
const contentful = require("contentful-management");
const { markeplaceData } = require("./quiz-poll-data");
const { quizPollModel } = require("../models/quiz.poll.model");
const { mongooseConnection, CONSTANTS } = require("../config");
const { Category } = require("../models/category.model");
const { User } = require("../models/users.model");
const { FileModel } = require("../models/files.model");

mongooseConnection();

const SPACE_ID = process.env.SPACE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ENVIRONMENT_ID = process.env.ENVIRONMENT_ID;
const client = contentful.createClient({ accessToken: ACCESS_TOKEN });

async function prepareLoadContentArray(markeplaceData) {
  const titles = markeplaceData.map((obj) => obj.title);
  const prepareData = await quizPollModel
    .find({
      isApplied: true,
      title: { $in: titles },
      isPublished: false,
      isApproved: CONSTANTS.ADMIN.REQS.APPROVED,
      isDeleted: null,
    })
    .populate({ path: "coverImage", model: FileModel })
    .populate({ path: "userId", select: "fname lname", model: User })
    .populate({ path: "categories", select: "name", model: Category })
    .select(
      "type title description questions coverImage duration ratings price converImage createdBy "
    );

  const mappedEvents = prepareData.map((event) => {
    return {
      title: { "en-US": event.title.toString() }, // Ensure string type for Text
      description: { "en-US": event.description.toString() }, // Ensure string type for Text
      totalQuestions: { "en-US": parseInt(event.questions.length, 10) }, // Integer type
      duration: { "en-US": parseInt(event.duration, 10) }, // Integer type
      type: { "en-US": event.type.toString() }, // Symbol type (short string)
      ratings: { "en-US": parseFloat(event.ratings) }, // Number type, parse to ensure it’s a float
      price: { "en-US": parseInt(event.price, 10) }, // Integer type, parse to ensure it’s an integer
      coverImage: { "en-US": event.coverImage.url.toString() }, // Symbol type (short string)
      createdBy: {
        "en-US": `${event.userId.fname} ${event.userId.lname}`.trim(), // Symbol type, combine and trim
      },
      id: { "en-US": event._id.toString() }, // Symbol type (short string)
      categories: {
        "en-US": event.categories.map((category) => category.name.toString()), // Array of Symbols (strings)
      },
    };
  });

  return mappedEvents;
}

// Function to create and publish a single entry
async function createAndPublishEntry(environment, contentTypeId, entryData) {
  const entry = await environment.createEntry(contentTypeId, {
    fields: {
      title: { "en-US": entryData.title["en-US"] }, // Access the value
      description: { "en-US": entryData.description["en-US"] }, // Access the value
      totalQuestions: { "en-US": entryData.totalQuestions["en-US"] }, // Access the value
      duration: { "en-US": entryData.duration["en-US"] }, // Access the value
      type: { "en-US": entryData.type["en-US"] }, // Access the value
      ratings: { "en-US": entryData.ratings["en-US"] }, // Access the value
      price: { "en-US": entryData.price["en-US"] }, // Access the value
      coverImage: { "en-US": entryData.coverImage["en-US"] }, // Access the value
      createdBy: { "en-US": entryData.createdBy["en-US"] }, // Access the value
      id: { "en-US": entryData.id["en-US"] }, // Access the value
      categories: { "en-US": entryData.categories["en-US"] }, // Access the value
    },
  });
  console.log("Uploaded card", entryData.title["en-US"]);
  await entry.publish();
}

async function deleteAllMarketplaceEntries() {
  try {
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment("master"); // or your specific environment

    const entries = await environment.getEntries({
      content_type: "marketplace",
      limit: 1000,
    });

    for (let entry of entries.items) {
      try {
        await entry.unpublish();
        await entry.delete();
        console.log("previouse marketplace content deleted");
      } catch (error) {
        console.log("Error :", error.message);
      }
    }
  } catch (error) {
    console.error("Error fetching or deleting marketplace entries:", error);
  }
}

// Use Promise.all to create and publish all entries
async function createAndPublishAllEntries() {
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT_ID);
  const contentTypeId = "marketplace";

  try {
    const prepareContents = await prepareLoadContentArray(markeplaceData);
    // await deleteAllMarketplaceEntries();
    await Promise.all(
      prepareContents.map((entryData) =>
        createAndPublishEntry(environment, contentTypeId, entryData)
      )
    );
    console.log("All entries have been created and published successfully.");
  } catch (error) {
    console.error(
      "An error occurred while creating or publishing entries:",
      error
    );
  }
}

// Execute the function to create and publish all entries
createAndPublishAllEntries();
