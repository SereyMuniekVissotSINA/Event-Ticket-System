import bcrypt from 'bcryptjs'
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
)

userSchema.pre('save', async function savePassword() {
  if (!this.isModified('password')) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

export type UserDocument = InferSchemaType<typeof userSchema> & {
  comparePassword(candidatePassword: string): Promise<boolean>
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User