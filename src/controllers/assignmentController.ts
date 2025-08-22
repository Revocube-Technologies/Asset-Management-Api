import { AppError } from "root/src/utils/error";
import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import {
  TCreateAssignmentType,
  TGetAllAssignmentsType,
  TReturnAssetType,
} from "../validation/assignmentValidator";
import {
  generatePaginationQuery,
  generatePaginationMeta,
} from "root/src/utils/query";

export const createAssignment = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin.id;

    const {
      assetId,
      assignedDate,
      employeeName,
      conditionAtAssignment,
      departmentId,
    } = req.body as unknown as TCreateAssignmentType;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, status: true },
    });

    if (!asset) {
      throw new AppError(codes.notFound, "Asset not found");
    }

    if (asset.status === "Assigned") {
      throw new AppError(codes.conflict, "Asset is already assigned");
    }

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) {
        throw new AppError(codes.notFound, "Department not found");
      }
    }

    const assignment = await prisma.assetAssigned.create({
      data: {
        assetId,
        assignedById: adminId!,
        assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
        employeeName,
        conditionAtAssignment,
        departmentId,
      },
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: "Assigned" },
    });

    res.status(codes.created).json({
      status: "success",
      message: "Assignment created successfully",
      data: assignment,
    });
  }
);

export const returnAsset = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin.id;

  const { assignmentId, conditionAtReturn } =
    req.body as unknown as TReturnAssetType;

  const assignment = await prisma.assetAssigned.findUnique({
    where: { id: assignmentId },
    include: { asset: true },
  });

  if (!assignment) {
    throw new AppError(codes.notFound, "Assignment not found");
  }

  if (assignment.returnDate) {
    throw new AppError(codes.conflict, "Asset has already been returned");
  }

  const updatedAssignment = await prisma.assetAssigned.update({
    where: { id: assignmentId },
    data: {
      returnDate: new Date(),
      conditionAtReturn,
      receivedById: adminId,
    },
  });

  await prisma.asset.update({
    where: { id: assignment.assetId },
    data: { status: "Available" },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset returned successfully",
    data: updatedAssignment,
  });
});

export const getAllAssignments = catchAsync(
  async (req: Request, res: Response) => {
    const { page, perPage } = req.query as unknown as TGetAllAssignmentsType;

    const totalAssignments = await prisma.assetAssigned.count();

    const assignments = await prisma.assetAssigned.findMany({
      select: {
        id: true,
        employeeName: true,
        assignedDate: true,
        returnDate: true,
        conditionAtAssignment: true,
        conditionAtReturn: true,
        createdAt: true,
        updatedAt: true,
        asset: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            status: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      count: totalAssignments,
    });

    res.status(codes.success).json({
      status: "success",
      message: "Assignments retrieved successfully",
      data: {
        pagination,
        assignments,
      },
    });
  }
);

export const getAssignmentById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const assignment = await prisma.assetAssigned.findUnique({
      where: { id },
      include: {
        asset: true,
        department: true,
        assignedBy: true,
      },
    });

    if (!assignment) {
      throw new AppError(codes.notFound, "Assignment not found");
    }

    res.status(codes.success).json({
      status: "success",
      message: "Assignment retrieved successfully",
      data: assignment,
    });
  }
);
