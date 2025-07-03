const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetadataSchema = new Schema({
  filename: {
    type: String,
    required: true,
    unique: true,
  },
});

const Metadata = mongoose.model("metadata", MetadataSchema);

module.exports = { Metadata };
