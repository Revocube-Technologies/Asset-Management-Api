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
import {
  TChangeAssetStatusType,
  TCreateAssetType,
  TGetAllAssetsType,
  TGetAssetByIdType,
  TUpdateAssetType,
} from "../validation/assetValidator";

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
  } = req.body as unknown as TCreateAssetType;

  const imageFile = req.file;

  const serialNumber = await generateSerialNumber();

  let imageUrl = "";
  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true, name: true },
  });
  const asset = await prisma.asset.create({
    data: {
      name,
      type,
      serialNumber,
      price,
      image: imageUrl,
      purchaseDate: new Date(purchaseDate).toISOString(),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      status: "Available",
      locationId,
      notes,
      purchaseType,
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

  res.status(codes.created).json({
    status: "success",
    message: `Asset created successfully: ${name} (${serialNumber})`,
    data: {
      asset,
      location: {
        id: location.id,
        name: location?.name,
      },
    },
  });
});

//TODO: work on the get all
export const getAllAssets = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage, status, type, locationId } =
    req.query as unknown as TGetAllAssetsType;

  const totalAssets = await prisma.asset.findMany({
    where: {
      isDeleted: false,
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
    count: totalAssets.length,
  });

  res.status(codes.success).json({
    status: "success",
    ...pagination,
    results: totalAssets,
  });
});

export const getAssetById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as TGetAssetByIdType;

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
  const {
    name,
    type,
    price,
    purchaseDate,
    warrantyExpiry,
    locationId,
    notes,
    purchaseType,
  } = req.body as unknown as TUpdateAssetType;

  const imageFile = req.file;

  let imageUrl = "";
  if (imageFile) {
    imageUrl = await uploadImageToCloudinary(imageFile);
  }

  const asset = await prisma.asset.update({
    where: { id, isDeleted: false },
    data: {
      name,
      type,
      price,
      purchaseDate,
      warrantyExpiry,
      locationId,
      notes,
      purchaseType,
    },
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
    const { status } = req.body as unknown as TChangeAssetStatusType;
    const adminId = req.admin?.id;

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

  res.status(codes.noContent).json({
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

//TODO: check
export const getAllAssetsLogs = catchAsync(
  async (req: Request, res: Response) => {
    const { page, perPage, status, type, locationId } =
      req.query as unknown as TGetAllAssetsType;

    const totalAssets = await prisma.asset.findMany({
      where: {
        isDeleted: false,
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
      count: totalAssets.length,
    });

    res.status(codes.success).json({
      status: "success",
      ...pagination,
      results: totalAssets.length,
      data: totalAssets,
    });
  }
);
