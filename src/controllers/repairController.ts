import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { AppError } from "root/src/utils/error";
import {
  TCompleteRepairType,
  TGetRepairByIdType,
  TLogRepairType,
  TGetRepairsType,
  TGeneralMaintenanceType,
} from "../validation/repairValidator";
import {
  generatePaginationQuery,
  generatePaginationMeta,
} from "root/src/utils/query";
import { Prisma } from "@prisma/client";

export const logRepair = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin.id;
  const { id: assetId } = req.params;
  const { description, repairCost, repairedBy, requestLogId } =
    req.body as unknown as TLogRepairType;

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new AppError(codes.notFound, "Asset not found");

  const repair = await prisma.repairLog.create({
    data: {
      adminId,
      assetId,
      description,
      repairCost,
      repairedBy,
      requestLogId,
      repairStatus: "Pending",
    },
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "UnderRepair" },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Repair logged successfully",
    data: repair,
  });
});

export const completeRepair = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin.id;
    const { id } = req.params;
    const { remarks } = req.body as unknown as TCompleteRepairType;

    const repair = await prisma.repairLog.findUnique({ where: { id } });
    if (!repair) throw new AppError(codes.notFound, "Repair not found");

    if (repair.repairStatus === "Completed") {
      throw new AppError(codes.conflict, "Repair is already completed");
    }

    const updatedRepair = await prisma.repairLog.update({
      where: { id },
      data: {
        repairStatus: "Completed",
        description: remarks,
        updatedAt: new Date(),
      },
    });

    await prisma.asset.update({
      where: { id: repair.assetId },
      data: { status: "Available" },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Repair marked as completed",
      data: updatedRepair,
    });
  }
);

export const getRepairs = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage, status } = req.query as unknown as TGetRepairsType;

  const where: Prisma.RepairLogWhereInput = {
    ...(status && { repairStatus: status }),
  };

  const totalRepairs = await prisma.repairLog.count({ where });

  const repairs = await prisma.repairLog.findMany({
    where,
    include: {
      asset: { select: { id: true, name: true, serialNumber: true } },
      admin: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      requestLog: {
        select: { id: true, description: true, requestStatus: true },
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
    count: totalRepairs,
  });

  res.status(codes.success).json({
    status: "success",
    message: "Repairs retrieved successfully",
    data: {
      ...pagination,
      repairs,
    },
  });
});

export const getRepairById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetRepairByIdType;

  const repair = await prisma.repairLog.findUnique({
    where: { id },
    include: {
      asset: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          status: true,
        },
      },
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      requestLog: {
        select: {
          id: true,
          description: true,
          requestStatus: true,
          employeeName: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!repair) {
    throw new AppError(codes.notFound, "Repair log not found");
  }

  res.status(codes.success).json({
    status: "success",
    message: "Repair log retrieved successfully",
    data: repair,
  });
});

export const createGeneralMaintenance = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin.id;

    if (!adminId) {
      throw new AppError(codes.unAuthorized, "Admin not found in request");
    }

    const { description, repairedBy, repairCost, assetIds } =
      req.body as unknown as TGeneralMaintenanceType;

    const validAssetIds = (assetIds || []).filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0
    );

    if (validAssetIds.length === 0) {
      throw new AppError(
        codes.badRequest,
        "At least one valid asset is required"
      );
    }

    const assets = await prisma.asset.findMany({
      where: { id: { in: validAssetIds }, isDeleted: false },
      select: { id: true },
    });

    if (assets.length !== validAssetIds.length) {
      throw new AppError(codes.notFound, "Some assets were not found");
    }

    const repairLogs = await prisma.$transaction(
      validAssetIds.map((assetId) =>
        prisma.repairLog.create({
          data: {
            description,
            repairedBy,
            repairCost,
            assetId,
            adminId,
          },
        })
      )
    );

    res.status(codes.success).json({
      status: "success",
      message: "General maintenance logs created successfully",
      count: repairLogs.length,
      data: repairLogs,
    });
  }
);
