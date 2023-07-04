import { Model } from 'mongoose';

export type IUser = {
  id: string;
  role: string;
  password: string;
};

// define usermodel type
export type UserModel = Model<IUser, Record<string, unknown>>;
