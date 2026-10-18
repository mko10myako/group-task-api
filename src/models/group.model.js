import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  role: {
    type: String,
    enum: [ "owner", "admin", "member"],
    default: "member",
  },

  joinedAt: {
    type: Date,
    default: Date.now

  }
},

{
  _id: false,
}

);


const groupSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },

 description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
  },

owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},

members: {
  type: [memberSchema],
  default: [],
}

},
{
  timestamps: true,
}
);

const Group = mongoose.model("Group", groupSchema);
export default Group;