const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const filesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    fileName: { type: String },
    dirName: { type: String },
    fileSize: { type: Number },
    mimetype: { type: String },
    bucket: { type: String },
    url: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: true }
);

const FileModel = mongoose.model("File", filesSchema);

module.exports = { FileModel };
