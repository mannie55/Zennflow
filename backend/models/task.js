import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true, // This will be the primary key since _id is false
    },
    description: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    client_updated_at: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      immutable: true, // Ensure client-sent createdAt is not changed
    }
  },
  {
    // Use Mongoose's timestamps to get server_updated_at automatically
    timestamps: { createdAt: false, updatedAt: 'server_updated_at' },
    _id: false, // Disable Mongoose's default _id
    versionKey: false, // Disable the __v field
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
