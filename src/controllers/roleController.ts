import { Request, Response } from "express";
import catchAsync from "root/src/utils/catchAsync";
import prisma from "root/prisma";
import codes from "root/src/utils/statusCode";
import { AppError } from "root/src/utils/error";
import {
  PERMISSIONS,
  COMPULSORY_PERMISSIONS,
} from "root/src/assets/permissions";
import {
  CreateRoleType,
  UpdateRoleType,
} from "root/src/validation/roleValidator";

export const createRole = catchAsync(async (req: Request, res: Response) => {
  const { name, permissions: requestPermissions } =
    req.body as unknown as CreateRoleType;

  const permissionSet = new Set([
    ...requestPermissions,
    ...COMPULSORY_PERMISSIONS,
  ]);
  const permissions = Array.from(permissionSet);

  const role = await prisma.role.create({
    data: { name, permissions },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Role created successfully",
    data: role,
  });
});

export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, permissions } = req.body as unknown as UpdateRoleType;

  const updatedRole = await prisma.role.update({
    where: { id },
    data: { name, permissions },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Role updated successfully",
    data: updatedRole,
  });
});

export const getRoles = catchAsync(async (_req: Request, res: Response) => {
  const roles = await prisma.role.findMany();

  res.status(codes.success).json({
    status: "success",
    message: "Roles retrieved successfully",
    data: roles,
  });
});

export const deleteRole = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError(codes.notFound, "Admin not found.");

    await prisma.role.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.status(codes.noContent).json({
      message: "Role Deleted Successfully.",
    });
  }
);

export const getAllPermissions = catchAsync(
  async (req: Request, res: Response) => {
    res.status(codes.success).json({
      message: "Permissions returned successfully",
      data: PERMISSIONS,
    });
  }
);
