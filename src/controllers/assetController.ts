import { purchaseStatus } from "@prisma/client";
import { AppError } from "root/src/utils/error";
import prisma from "root/prisma";
import { Request, Response } from "express";
import uploadImageToCloudinary from "root/src/service/imageUploadService";
import { generateSerialNumber } from "root/src/utils/function";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import {
  generatePaginationQuery,
  generatePaginationMeta,
} from "root/src/utils/query";

export const createAsset = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin?.id;

  const {
    name,
    type,
    price,
    purchaseDate,
    warrantyExpiry,
    locationId,
    notes,
    purchaseType,
  } = req.body;

  const imageFile = req.file;

  if (![name, type, price, purchaseDate, locationId].every(Boolean)) {
    throw new AppError(
      codes.badRequest,
      "All required fields must be provided"
    );
  }

  if (purchaseType && !Object.values(purchaseStatus).includes(purchaseType)) {
    throw new AppError(codes.badRequest, "Invalid purchase type");
  }

  const serialNumber = await generateSerialNumber();

  let imageUrl = "";
  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }

  const asset = await prisma.asset.create({
    data: {
      name,
      type,
      serialNumber,
      price: parseInt(price),
      image: imageUrl,
      purchaseDate: new Date(purchaseDate),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      status: "Available",
      locationId,
      notes,
      purchaseType: purchaseType || purchaseStatus.NEW,
    },
  });

  await prisma.assetLog.create({
    data: {
      assetId: asset.id,
      adminId,
      eventType: "Created",
      description: `Asset created: ${name} (${serialNumber})`,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: `Asset created successfully: ${name} (${serialNumber})`,
    data: asset,
  });
});

interface GetAllAssetsQuery {
  page?: string;
  perPage?: string;
  status?: string;
  type?: string;
  locationId?: string;
}

export const getAllAssets = catchAsync(
  async (req: Request<{}, {}, {}, GetAllAssetsQuery>, res: Response) => {
    const { page = "1", perPage = "10", status, type, locationId } = req.query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericPerPage = Math.max(parseInt(perPage, 10), 1);

    const where: {
      status?: string;
      type?: string;
      locationId?: string;
      isDeleted: boolean;
    } = { isDeleted: false };

    if (status) where.status = status;
    if (type) where.type = type;
    if (locationId) where.locationId = locationId;

    const totalAssets = await prisma.asset.count({ where });

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...generatePaginationQuery({
        page: numericPage,
        perPage: numericPerPage,
      }),
      include: {
        location: true,
      },
    });

    const pagination = generatePaginationMeta({
      page: numericPage,
      perPage: numericPerPage,
      count: totalAssets,
    });

    res.status(codes.success).json({
      status: "success",
      ...pagination,
      results: assets.length,
      assets,
    });
  }
);

export const getAssetById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const asset = await prisma.asset.findUnique({
    where: { id, isDeleted: false },
    include: {
      location: true,
      assignments: true,
      repairs: true,
      RequestLog: true,
    },
  });

  if (!asset) {
    throw new AppError(codes.notFound, "Asset not found");
  }

  res.status(codes.success).json({
    status: "success",
    asset,
  });
});

export const updateAsset = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin?.id;
  const updateData = req.body;

  const asset = await prisma.asset.update({
    where: { id, isDeleted: false },
    data: updateData,
  });

  await prisma.assetLog.create({
    data: {
      assetId: asset.id,
      adminId,
      eventType: "Updated",
      description: `Asset updated: ${asset.name}`,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset updated successfully",
    asset,
  });
});

export const changeAssetStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.admin?.id;

    const validStatuses = ["available", "assigned", "under_repair", "disposed"];
    if (!validStatuses.includes(status)) {
      throw new AppError(codes.badRequest, "Invalid asset status");
    }

    const asset = await prisma.asset.update({
      where: { id, isDeleted: false },
      data: { status },
    });

    await prisma.assetLog.create({
      data: {
        assetId: asset.id,
        adminId,
        eventType: "Updated",
        description: `Status changed to ${status}`,
      },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Asset status updated successfully",
      asset,
    });
  }
);

export const deleteAsset = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const asset = await prisma.asset.update({
    where: { id, isDeleted: false },
    data: { isDeleted: true },
  });

  await prisma.assetLog.create({
    data: {
      assetId: asset.id,
      adminId,
      eventType: "Deleted",
      description: `Asset deleted: ${asset.name}`,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset deleted successfully",
  });
});

export const getAssetLogs = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const logs = await prisma.assetLog.findMany({
    where: { assetId: id },
    orderBy: { createdAt: "desc" },
  });

  res.status(codes.success).json({
    status: "success",
    results: logs.length,
    logs,
  });
});
