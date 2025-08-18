import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { AppError } from "root/src/utils/error";
import { TCreateRequestType } from "../validation/requestValidator";
import { generatePaginationQuery, generatePaginationMeta, generateRangeQuery } from "root/src/utils/query";

export const createRequest = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;
  const { assetId, employeeName, departmentId, description } =
    req.body as unknown as TCreateRequestType;

  if (!assetId || !employeeName || !departmentId || !description) {
    throw new AppError(codes.badRequest, "All fields are required");
  }

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

  // await prisma.auditLog.create({
  //   data: {
  //     adminId,
  //     action: "REQUEST_CREATE",
  //     entity: "RequestLog",
  //     entityId: request.id,
  //     details: `Repair request created for asset ${asset.name} by ${employeeName}`,
  //   },
  // });

  res.status(codes.success).json({
    status: "success",
    message: "Request created successfully",
    data: request,
  });
});


export const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;
  const { id } = req.params;
  const { status, remarks } = req.body as unknown as ;


  if (!status || !["Approved", "Declined"].includes(status)) {
    throw new AppError(codes.badRequest, "Invalid status. Must be Approved or Declined.");
  }


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
        requestId: request.id,
        adminId,
        description: remarks || "Repair approved",
        repairDate: new Date(),
        repairStatus: "InProgress",
      },
    });
  }


  // await prisma.auditLog.create({
  //   data: {
  //     adminId,
  //     action: "REQUEST_UPDATE",
  //     entity: "RequestLog",
  //     entityId: request.id,
  //     details: `Request ${id} updated to ${status}`,
  //   },
  // });


  res.status(codes.success).json({
    status: "success",
    message: `Request updated to ${status}`,
    data: updatedRequest,
  });
});




export const getAllRequests = catchAsync(async (req: Request, res: Response) => {
  const {
    page = "1",
    perPage = "15",
    status,
    departmentId,
    assetId,
    minDate,
    maxDate,
  } = req.query as {
    page?: string;
    perPage?: string;
    status?: "Pending" | "Approved" | "Declined";
    departmentId?: string;
    assetId?: string;
    minDate?: string;
    maxDate?: string;
  };

  const pageNum = parseInt(page, 10) || 1;
  const perPageNum = parseInt(perPage, 10) || 15;

  // Build filters
  const filters: any = {};
  if (status) filters.requestStatus = status;
  if (departmentId) filters.departmentId = departmentId;
  if (assetId) filters.assetId = assetId;

  if (minDate || maxDate) {
    filters.requestDate = generateRangeQuery({
      min: minDate ? new Date(minDate) : undefined,
      max: maxDate ? new Date(maxDate) : undefined,
      field: "requestDate",
    }).requestDate;
  }

  // Count total
  const totalRequests = await prisma.requestLog.count({ where: filters });

  // Query with pagination
  const requests = await prisma.requestLog.findMany({
    where: filters,
    include: {
      asset: { select: { id: true, name: true, serialNumber: true, status: true } },
      department: { select: { id: true, name: true } },
      admin: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    ...generatePaginationQuery({ page: pageNum, perPage: perPageNum }),
  });

  // Pagination meta
  const pagination = generatePaginationMeta({
    page: pageNum,
    perPage: perPageNum,
    count: totalRequests,
  });

  // Response
  res.status(codes.success).json({
    status: "success",
    ...pagination,
    results: requests.length,
    data: requests,
  });
});
