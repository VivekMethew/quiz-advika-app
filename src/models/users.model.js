const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    idd: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "MODERATOR",
    },
    isAuth: {
      type: Boolean,
      default: false,
    },
    fname: {
      type: String,
      default: null,
    },
    lname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    avatar: { type: Schema.Types.ObjectId, ref: "File", default: null },
    profileUrl: { type: String, default: null },
    isBlock: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "VERIFIED",
    },
    isDeleted: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// hash password before saving to database
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// validate Password
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
