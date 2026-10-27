import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    profileType: {
      type: String,
      required: true,
      enum: ['reader', 'student', 'professional', 'other'],
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
