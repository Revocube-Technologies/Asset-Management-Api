import { Request, Response } from "express";
import {
  TGetAllAdminsType,
  TResetPasswordType,
  TForgotPasswordType,
  TCreateAdminType,
  TUpdateAdminType,
  TAdminLoginType,
  TGetAdminByIdType,
  TAdminUpdatePasswordType,
} from "root/src/validation/authValidator";
import prisma from "root/prisma";
import { Admin } from "@prisma/client";
import bcrypt from "bcrypt";
import OTP from "otp-generator";
import catchAsync from "root/src/utils/catchAsync";
import { AppError } from "root/src/utils/error";
import jwt from "jsonwebtoken";
import codes from "root/src/utils/statusCode";
import config from "root/src/config/env";
import { COMPULSORY_PERMISSIONS } from "root/src/assets/permissions";
import {
  generatePaginationQuery,
  generatePaginationMeta,
} from "root/src/utils/query";
import { getFrontendUrl } from "root/src/utils/function";
import { comparePassword } from "root/src/utils/function";
import { generateResetToken } from "root/src/utils/token";
import crypto from "crypto";

const generateUserToken = (user: Admin) => {
  return jwt.sign(
    {
      id: user.id,
      permissions: user.permissions,
      role: "admin",
    },
    config.jwtSecret,
    {
      expiresIn: "1d",
    }
  );
};

const createSendToken = (
  user: Admin,
  status: "success",
  statuscode: number,
  res: Response,
  message: string
) => {
  const token = generateUserToken(user);

  const cookieExpires = Number(config.jwtCookieExpires) || 1;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none" as const,
    secure: true,
  };

  if (config.nodeEnv === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  res.status(statuscode).json({
    status,
    message,
    token,
    data: {
      user,
    },
  });
};

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password: unhashedPassword,
    roleId,
    permissions: requestPermissions = [],
  } = req.body as unknown as TCreateAdminType;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new AppError(codes.notFound, "Role not found");
  }

  const password = await bcrypt.hash(unhashedPassword, 12);

  const code = OTP.generate(5, {
    upperCaseAlphabets: true,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const permissionSet = new Set([
    ...role.permissions,
    ...requestPermissions,
    ...COMPULSORY_PERMISSIONS,
  ]);

  const permissions = Array.from(permissionSet);

  const admin = await prisma.admin.create({
    data: {
      firstName,
      lastName,
      email,
      phoneNumber,
      roleId,
      password,
      permissions,
      isEnabled: true,
    },
  });

  //TODO: send welcome email with login details

  res.status(codes.created).json({
    status: "success",
    message: "Admin Account Successfully Created",
    data: { id: admin.id, email: admin.email, role: role.name },
  });
});

export const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    roleId,
    permissions: requestPermissions = [],
  } = req.body as unknown as TUpdateAdminType;

  const permissionSet = new Set([
    ...requestPermissions,
    ...COMPULSORY_PERMISSIONS,
  ]);
  const permissions = Array.from(permissionSet);

  const admin = await prisma.admin.update({
    where: { id },
    data: { firstName, lastName, phoneNumber, roleId, permissions },
  });

  res.status(codes.success).json({ status: "success", user: admin });
});

export const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as unknown as TAdminLoginType;

  const admin = await prisma.admin.findUnique({
    where: { email: email },
  });

  if (!admin) {
    throw new AppError(codes.badRequest, "Admin does not exist");
  }

  const isPasswordCorrect = await comparePassword(password, admin.password);
  if (!isPasswordCorrect) {
    throw new AppError(codes.unAuthorized, "Incorrect Password");
  }

  createSendToken(
    admin,
    "success",
    codes.success,
    res,
    `Login Successful, Welcome, ${admin.firstName}`
  );
});

export const adminForgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body as unknown as TForgotPasswordType;

    const admin = await prisma.admin.findUnique({ where: { email: email } });

    if (!admin)
      throw new AppError(codes.notFound, "Admin Username/Email not found");

    const { resetToken, hashedToken, tokenExpiration } =
      await generateResetToken();

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: tokenExpiration,
      },
    });

    const passwordResetUrl = getFrontendUrl(`/api/v1/admin/auth/reset-password/:${resetToken}}`);

    //TODO: add email sendAdminResetPassword

    res.status(codes.success).json({
      status: "success",
      message: `Password reset token sent to ${admin.email}`,
      data: {
        resetToken,
        setUrl: passwordResetUrl,
      },
    });
  }
);

export const adminResetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { password } = req.body as unknown as TResetPasswordType;

    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await prisma.admin.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!admin)
      throw new AppError(codes.badRequest, "Invalid or Expired Token");

    const newPassword = await bcrypt.hash(password, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    res.status(codes.success).json({
      status: "success",
      message: `Password reset for Admin: ${admin.email} successful. Kindly log in.`,
    });
  }
);

export const adminUpdatePassword = catchAsync(
  async (req: Request, res: Response) => {
    const { oldPassword, newPassword } =
      req.body as unknown as TAdminUpdatePasswordType;
    const { id } = req.params;
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new AppError(codes.notFound, "Admin not found");
    }

    const isPasswordCorrect = await comparePassword(
      oldPassword,
      admin.password
    );

    if (!isPasswordCorrect)
      throw new AppError(codes.badRequest, "Password is incorrect, try again");

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id },
      data: {
        password: newPasswordHash,
      },
    });

    res.status(codes.success).json({
      status: "success",
      message: `Password updated for Admin: ${admin.email} successfully`,
      data: {
        id: admin.id,
        email: admin.email,
      },
    });
  }
);

export const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage } = req.query as unknown as TGetAllAdminsType;

  const totalAdmins = await prisma.admin.count();

  const users = await prisma.admin.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      isEnabled: true,
      role: { select: { id: true } },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    ...generatePaginationQuery({ page, perPage }),
  });

  const pagination = generatePaginationMeta({
    page,
    perPage,
    count: totalAdmins,
  });

  res.status(codes.success).json({
    status: "success",
    ...pagination,
    results: users.length,
    users,
  });
});

export const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetAdminByIdType;

  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      isEnabled: true,
      role: { select: { id: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw new AppError(codes.notFound, "Admin not found");
  }

  res.status(codes.success).json({
    status: "success",
    message: "Admin details retrieved successfully",
    admin,
  });
});

export const suspendAdmin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new AppError(codes.notFound, "Admin not found.");

    await prisma.admin.update({
      where: { id },
      data: { isEnabled: false },
    });

    res.status(codes.success).json({
      message: "Admin Account Suspended.",
    });
  }
);

export const adminLogout = catchAsync(async (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
  };

  res.clearCookie("jwt", cookieOptions);

  res.status(codes.success).json({
    status: "success",
    message: "logged out successfully",
  });
});
