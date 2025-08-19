import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { AppError } from "root/src/utils/error";
import { TCreateRequestType, TGetAllRequestsType, TGetRequestByIdType, TUpdateRequestStatusType } from "../validation/requestValidator";
import { generatePaginationQuery, generatePaginationMeta, generateRangeQuery } from "root/src/utils/query";
import { Prisma } from "@prisma/client";

export const createRequest = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;
  const { assetId, employeeName, departmentId, description } =
    req.body as unknown as TCreateRequestType;


  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    throw new AppError(codes.notFound, "Asset not found");
  }

  const existingRequest = await prisma.requestLog.findFirst({
    where: { assetId, requestStatus: "Pending" },
  });
  if (existingRequest) {
    throw new AppError(
      codes.conflict,
      "There is already a pending request for this asset"
    );
  }

  const request = await prisma.requestLog.create({
    data: {
      adminId,
      assetId,
      employeeName,
      departmentId,
      requestDate: new Date(),
      description,
      requestStatus: "Pending",
    },
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "RequestRepair" },
  });

  res.status(codes.created).json({
    status: "success",
    message: "Request created successfully",
    data: request,
  });
});


export const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;
  const { id } = req.params;
  const { status } = req.body as unknown as TUpdateRequestStatusType;

  const request = await prisma.requestLog.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!request) {
    throw new AppError(codes.notFound, "Request not found");
  }

  if (request.requestStatus !== "Pending") {
    throw new AppError(codes.conflict, "Request has already been processed");
  }


  const updatedRequest = await prisma.requestLog.update({
    where: { id },
    data: {
      requestStatus: status,
      updatedAt: new Date(),
    },
  });


  if (status === "Approved") {
    await prisma.asset.update({
      where: { id: request.assetId },
      data: { status: "UnderRepair" },
    });

    await prisma.repairLog.create({
      data: {
        assetId: request.assetId,
        requestLogId: request.id,
        adminId,
        repairDate: new Date(),
        repairStatus: "InProgress",
      },
    });
  }

  res.status(codes.success).json({
    status: "success",
    message: `Request updated to ${status}`,
    data: updatedRequest,
  });
});

export const getAllRequests = catchAsync(async (req: Request, res: Response) => {
  const {
    page,
    perPage,
    status,
    departmentId,
    assetId,
    minDate,
    maxDate,
  } = req.validatedQuery as TGetAllRequestsType;


  const where: Prisma.RequestLogWhereInput = {
    ...(status && { requestStatus: { equals: status } }),
    ...(departmentId && { departmentId: { equals: departmentId } }),
    ...(assetId && { assetId: { equals: assetId } }),
    ...(minDate || maxDate
      ? {
          requestDate: {
            ...(minDate && { gte: new Date(minDate) }),
            ...(maxDate && { lte: new Date(maxDate) }),
          },
        }
      : {}),
  };

  const totalRequests = await prisma.requestLog.count({ where });

  const requests = await prisma.requestLog.findMany({
    where,
    include: {
      asset: { select: { id: true, name: true, serialNumber: true, status: true } },
      department: { select: { id: true, name: true } },
      admin: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    ...generatePaginationQuery({
      page: Number(page),
      perPage: Number(perPage),
    }),
  });

  const pagination = generatePaginationMeta({
    page: Number(page),
    perPage: Number(perPage),
    count: totalRequests,
  });

  res.status(codes.success).json({
    status: "success",
    ...pagination,
    results: requests.length,
    data: requests,
  });
});

export const getRequestById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetRequestByIdType;

  const request = await prisma.requestLog.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, name: true, serialNumber: true, status: true } },
      department: { select: { id: true, name: true } },
      admin: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!request) {
    throw new AppError(codes.notFound, "Request not found");
  }

  res.status(codes.success).json({
    status: "success",
    data: request,
  });
});
