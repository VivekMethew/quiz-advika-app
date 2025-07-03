require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.apiVersions = { s3: "2012-10-17" };

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});
module.exports = { s3: new AWS.S3() };
