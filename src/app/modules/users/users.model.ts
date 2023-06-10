import { Model, Schema, model } from 'mongoose'
import { IUser } from './users.interface'

// define usermodel type
type UserModel = Model<IUser, object>

// create user schema
const userSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

// create user model
export const User = model<IUser, UserModel>('User', userSchema)
