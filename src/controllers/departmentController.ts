import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import {
  TCreateDepartmentType,
  TGetAllDepartmentType,
  TGetDepartmentType,
  TUpdateDepartmentType,
} from "../validation/departmentValidator";
import {
  generatePaginationQuery,
  generatePaginationMeta,
} from "root/src/utils/query";
import { AppError } from "../utils/error";

export const createDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin.id;

    const { name } = req.body as unknown as TCreateDepartmentType;

    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDepartment) {
      throw new AppError(codes.conflict, "Department already exists");
    }

    const department = await prisma.department.create({
      data: {
        name,
        createdBy: adminId,
      },
    });

    res.status(codes.created).json({
      status: "success",
      message: "Department created successfully",
      data: department,
    });
  }
);

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

export const getAllDepartments = catchAsync(
  async (req: Request, res: Response) => {
  const {page,perPage } = req.query as unknown as TGetAllDepartmentType;

    const totalDepartments = await prisma.department.count();

    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      ...generatePaginationQuery({
        page,
        perPage,
      }),
    });

    const pagination = generatePaginationMeta({
      page,
      perPage,
      count: totalDepartments,
    });

    res.status(codes.success).json({
      status: "success",
      message: "Departments retrieved successfully",
      data:{
      pagination,
      departments
     } 
    });
  });

export const updateDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.admin.id;
    const { name } = req.body as unknown as TUpdateDepartmentType;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        createdBy: adminId,
      },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Department updated successfully",
      department,
    });
  }
);

export const deleteDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.admin.id;

    const department = await prisma.department.update({
      where: { id, createdBy: adminId },
      data: { isDeleted: true },
    });

    res.status(codes.noContent).json({
      status: "success",
      message: "Department soft deleted successfully",
      department,
    });
  }
);

