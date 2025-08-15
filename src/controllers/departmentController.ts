import { AppError } from "root/src/utils/error";
import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { TCreateDepartmentType, TGetAllDepartmentType, TGetDepartmentType } from "../validation/departmentValidator";

export const createDepartment = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;

  const {
    name
  } = req.body as unknown as TCreateDepartmentType;

  const department = await prisma.department.create({
    data: {
      name
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Department created successfully",
    data: department,
  }); 
});

export const getDepartment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetDepartmentType;

  const department = await prisma.department.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Department retrieved successfully",
    department,
  });
});

export const getAllDepartments = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage } = req.query as unknown as TGetAllDepartmentType;

  const totalDepartments = await prisma.department.count();

  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    ...(page && perPage && { take: perPage, skip: (page - 1) * perPage }),
  });

  const pagination = {
    page,
    perPage,
    count: totalDepartments,
  };

  res.status(codes.success).json({
    status: "success",
    ...pagination,
    results: departments.length,
    departments,
  });
});

export const updateDepartment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetDepartmentType;
  const adminId = req.admin?.id;
  const {
    name
  } = req.body as unknown as TCreateDepartmentType;

  const department = await prisma.department.update({
    where: { id },
    data: {
      name
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Department updated successfully",
    department,
  });
});

export const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetDepartmentType;
  const adminId = req.admin?.id;

  const department = await prisma.department.delete({
    where: { id },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Department deleted successfully",
    department,
  });
});
