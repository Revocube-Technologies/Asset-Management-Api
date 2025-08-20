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
  TGetAllAssetsLogsType,
  TGetAssetByIdType,
  TUpdateAssetType,
  TGetAllAssetsTypes,
} from "../validation/assetValidator";
import { AssetStatus, Prisma } from "@prisma/client";

export const createAsset = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.admin.id;

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
    select: { id: true },
  });

  if (!location) {
    throw new AppError(codes.notFound, "Location not found");
  }

  const asset = await prisma.asset.create({
    data: {
      name,
      type,
      serialNumber,
      price: Number(price),
      image: imageUrl,
      purchaseDate: new Date(purchaseDate).toISOString(),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      status: "Available",
      locationId,
      notes,
      purchaseType,
    },
    include: {
      location: {
        select: { id: true, name: true },
      },
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
    data: asset,
  });
});

export const getAllAssets = catchAsync(async (req: Request, res: Response) => {
  const { page, perPage, status, type, locationId } =
    req.validatedQuery as TGetAllAssetsTypes;

  const where: Prisma.AssetWhereInput = {
    isDeleted: false,
    ...(status && { status: status as AssetStatus }),
    ...(type && { type }),
    ...(locationId && { locationId }),
  };

  const totalAssets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...generatePaginationQuery({
      page: Number(page),
      perPage: Number(perPage),
    }),
  });

  const pagination = generatePaginationMeta({
    page: Number(page),
    perPage: Number(perPage),
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

  const asset = await prisma.asset.findFirst({
    where: { id, isDeleted: false },
    select: {
      id: true,
      name: true,
      type: true,
      serialNumber: true,
      price: true,
      purchaseDate: true,
      warrantyExpiry: true,
      status: true,
      image: true,
      notes: true,
      purchaseType: true,
      createdAt: true,
      updatedAt: true,
      location: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
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
  const adminId = req.admin.id;
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
      price: Number(price),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
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

export const getAllAssetsLogs = catchAsync(
  async (req: Request, res: Response) => {
    const validatedQuery = req.validatedQuery ?? { page: 1, perPage: 15 };
    const { page, perPage, status, type, locationId } =
      validatedQuery as TGetAllAssetsLogsType;

    const where: Prisma.AssetLogWhereInput = {
      asset: {
        isDeleted: false,
        ...(status && { status: { equals: status } }),
        ...(type && { type: { equals: type } }),
        ...(locationId && { locationId: { equals: locationId } }),
      },
    };

    const totalLogs = await prisma.assetLog.count({ where });

    const logs = await prisma.assetLog.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            status: true,
            type: true,
            locationId: true,
            purchaseDate: true,
            warrantyExpiry: true,
            price: true,
            purchaseType: true,
          },
        },
        admin: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
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
      count: totalLogs,
    });

    res.status(codes.success).json({
      status: "success",
      ...pagination,
      results: logs.length,
      data: logs,
    });
  }
);
