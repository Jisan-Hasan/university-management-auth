import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { User } from '../user/user.model';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { id, password } = payload;

  // const user = new User();

  const isUserExists = await User.isUserExists(id);

  if (!isUserExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  if (
    isUserExists.password &&
    !(await User.isPasswordMatch(password, isUserExists.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  //   create access token & refresh token -> JWT
  const { id: userId, role, needsPasswordChange } = isUserExists;
  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token');
  }
  // check if user deleted or not
  const { userId } = verifiedToken;
  const isUserExists = await User.isUserExists(userId);
  if (!isUserExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'USer does not exists');
  }
  // generate new token
  const newAccessToken = jwtHelpers.createToken(
    { id: isUserExists.id, role: isUserExists.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { newPassword, oldPassword } = payload;
  // const isUserExists = await User.isUserExists(user?.userId);

  // alternative way
  const isUserExists = await User.findOne({ id: user?.userId }).select(
    '+password'
  );
  if (!isUserExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  // checking old password
  if (
    isUserExists.password &&
    !(await User.isPasswordMatch(oldPassword, isUserExists.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old Password is incorrect');
  }

  /*
  // update password -> way 1

  // hash password before saving
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const query = { id: user?.userId };
  const updatedData = {
    password: newHashedPassword,
    needsPasswordChange: false,
    passwordChangedAt: new Date(),
  };
  // update password
  await User.findOneAndUpdate(query, updatedData);

  */

  // alternative way to change password -> using save()
  isUserExists.needsPasswordChange = false;
  isUserExists.password = newPassword;

  isUserExists.save();
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
};
