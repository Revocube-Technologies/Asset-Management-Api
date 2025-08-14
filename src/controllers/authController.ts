import { generatePaginationMeta } from "./../assets/functions";
import { Request, Response } from "express";
import {
  CreateAdminType,
  ForgotPasswordType,
  GetAdminType,
  ResetPasswordType,
  AdminLoginType,
  UpdateAdminStatusType,
  UpdateAdminType,
} from "root/src/validation/adminValidation";
import prisma from "../prisma";
import { exclude } from "root/src/utils/function";
import bcrypt from "bcrypt";
import OTP from "otp-generator";
import catchAsync from "root/src/utils/catchAsync";
import { AppError } from "root/src/utils/error";
import jwt from "jsonwebtoken";
import codes from "root/src/utils/statusCode";
import env from "root/src/onfig/env";
import { COMPULSORY_PERMISSIONS } from "../assets/constants";

const secret = env.JWT_SECRET || "my-secret-key";

export const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password: unhashedPassword,
    roleId,
    permissions: requestPermissions = [],
  } = req.body as unknown as CreateAdminType;

  const role = await prisma.role.findUniqueOrThrow({
    where: { id: roleId },
  });

  const password = await bcrypt.hash(unhashedPassword, 12);
  const code = OTP.generate(5, {
    upperCaseAlphabets: true,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  const permissionSet = new Set([
    ...(role.permissions as string[]),
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

  // TODO: Add email sending logic here

  res.status(codes.created).json({
    message: "Admin Account Successfully Created",
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
  } = req.body as unknown as UpdateAdminType;

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

export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as unknown as AdminLoginType;

  const admin = await prisma.admin.findUniqueOrThrow({
    where: { email },
    include: {
      role: true,
      store: true,
    },
  });

  if (!admin.isEnabled) throw new AppError("Your account isn't enabled", 400);

  if (!(await bcrypt.compare(password, admin.password)))
    throw new AppError("Invalid credentials", 400);

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      permissions: admin.role.permissions,
    },
    secret,
    { expiresIn: "2d" }
  );

  res.json({
    message: "Admin logged in",
    user: exclude(admin, ["password", "code"]),
    token,
  });
});

export const adminForgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body as unknown as ForgotPasswordType;

    const admin = await prisma.admin.findUniqueOrThrow({
      where: { email },
    });

    const token = jwt.sign({ email: email, id: admin.id }, secret, {
      expiresIn: "1h",
    });

    // TODO: Add email sending logic here

    res.json({ message: "Email sent successfully" });
  }
);

export const adminResetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { token, password: unhashedPassword } =
      req.body as unknown as ResetPasswordType;

    const decoded = jwt.verify(token, secret) as { id: string; email: string };

    const password = await bcrypt.hash(unhashedPassword, 12);

    await prisma.admin.update({
      where: { id: decoded.id },
      data: { password },
    });

    res.json({ message: "Password reset successfully" });
  }
);

export const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage } = req.query as unknown as TGetAllAdminsType;

  const totalAdmins = await prisma.admin.count();

  const users = await prisma.admin.findMany({
    select: {
      id: true,
      fullName: true,
      username: true,
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
  const { id } = req.params as unknown as TGetAllAdminByIdType;

  const admin = await prisma.admin.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      username: true,
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
