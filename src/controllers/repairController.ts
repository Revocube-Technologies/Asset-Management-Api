import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { AppError } from "root/src/utils/error";

export const logRepair = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;
  const { id: assetId } = req.params;
  const { description, repairCost, repairedBy, requestLogId } = req.body;

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

export const completeRepair = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;
  const { id } = req.params;
  const { remarks } = req.body;

  const repair = await prisma.repairLog.findUnique({ where: { id } });
  if (!repair) throw new AppError(codes.notFound, "Repair not found");

  if (repair.repairStatus === "Completed") {
    throw new AppError(codes.conflict, "Repair is already completed");
  }

  const updatedRepair = await prisma.repairLog.update({
    where: { id },
    data: {
      repairStatus: "Completed",
      description: remarks || repair.description,
      updatedAt: new Date(),
    },
  });

  // Set asset back to "Available"
  await prisma.asset.update({
    where: { id: repair.assetId },
    data: { status: "Available" },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Repair marked as completed",
    data: updatedRepair,
  });
});

export const getRepairs = catchAsync(async (req: Request, res: Response) => {
  const { page = "1", perPage = "15", status } = req.query as {
    page?: string;
    perPage?: string;
    status?: "Pending" | "InProgress" | "Completed";
  };

  const pageNum = parseInt(page, 10) || 1;
  const perPageNum = parseInt(perPage, 10) || 15;

  const filters: any = {};
  if (status) filters.repairStatus = status;

  const totalRepairs = await prisma.repairLog.count({ where: filters });

  const repairs = await prisma.repairLog.findMany({
    where: filters,
    include: {
      asset: { select: { id: true, name: true, serialNumber: true } },
      admin: { select: { id: true, firstName: true, lastName: true, email: true } },
      requestLog: { select: { id: true, description: true, requestStatus: true } },
    },
    orderBy: { createdAt: "desc" },
    ...generatePaginationQuery({ page: pageNum, perPage: perPageNum }),
  });

  const pagination = generatePaginationMeta({
    page: pageNum,
    perPage: perPageNum,
    count: totalRepairs,
  });

  res.status(codes.success).json({
    status: "success",
    ...pagination,
    results: repairs.length,
    data: repairs,
  });
});


