import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
      min: 1, // Duration must be at least 1ms
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
    },
    focusedTime: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for finding user's sessions
    },
    task: {
      type: String, // Reference Task's id field, not MongoDB _id
      ref: "Task",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

sessionSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
