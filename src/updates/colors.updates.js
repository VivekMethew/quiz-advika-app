require("dotenv").config();
const { mongooseConnection, CONSTANTS } = require("../config");
const { Category } = require("../models/category.model");
mongooseConnection();

(async () => {
  try {
    let lastAssignedIndex = -1;

    const colors = [
      CONSTANTS.CATEGORY.Green,
      CONSTANTS.CATEGORY.Blue,
      CONSTANTS.CATEGORY.Red,
      CONSTANTS.CATEGORY.Pink,
    ];

    function getNextColorCode() {
      lastAssignedIndex = (lastAssignedIndex + 1) % colors.length;
      return colors[lastAssignedIndex];
    }

    const response = await Category.find({});

    await Promise.all(
      response.map(async (item) => {
        const colorCode = getNextColorCode();
        console.log(
          `Assigned color code for ID : ${item._id}, ${item.name}: ${colorCode}`
        );
        await Category.findByIdAndUpdate(
          item._id,
          { color: colorCode },
          { new: true }
        );
      })
    );
  } catch (error) {
    console.log("ERROR =>", error);
  }
  process.exit();
})();
