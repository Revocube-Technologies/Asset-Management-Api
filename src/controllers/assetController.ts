import { AppError } from "root/src/utils/error";
import prisma from "root/prisma";
import { Request, Response } from "express";
import uploadImageToCloudinary from "root/src/service/imageUploadService";
import { generateSerialNumber } from "root/src/utils/function";
import codes from "root/src/utils/statusCode";
import catchAsync from "../utils/catchAsync";
import {
  generatePaginationQuery,
  generatePaginationMeta,
} from "root/src/utils/query";
import {
  TChangeAssetStatusType,
  TCreateAssetType,
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
      price,
      image: imageUrl,
      purchaseDate: new Date(purchaseDate),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      status: "Available",
      locationId,
      notes,
      purchaseType,
      id: adminId
    },
    include: {
      location: {
        select: { id: true, name: true },
      },
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
    req.query as unknown as TGetAllAssetsTypes;

  const where: Prisma.AssetWhereInput = {
    isDeleted: false,
    ...(status && { status: status as AssetStatus }),
    ...(type && { type }),
    ...(locationId && { locationId }),
  };

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...generatePaginationQuery({
      page,
      perPage,
    }),
  });

  const assetCount = await prisma.asset.count({
    where,
  });

  const pagination = generatePaginationMeta({
    page,
    perPage,
    count: assetCount,
  });

  res.status(codes.success).json({
    status: "success",
    message: "Assets retrieved successfully",
    data: {
      pagination,
      assets,
    },
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
    message: "Asset retrieved successfully",
    data: asset,
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
      price,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : undefined,
      locationId,
      notes,
      purchaseType,
      id: adminId,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset updated successfully",
    data: {
      ...asset,
      image: imageUrl,
    },
  });
});

export const changeAssetStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as unknown as TChangeAssetStatusType;
    const adminId = req.admin.id;

    const asset = await prisma.asset.update({
      where: { id, isDeleted: false },
      data: { status, id: adminId },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Asset status updated successfully",
      data: {
        asset,
      },
    });
  }
);

export const deleteAsset = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const asset = await prisma.asset.update({
    where: { id, isDeleted: false },
    data: { isDeleted: true, id: adminId },
  });

  res.status(codes.noContent).json({
    status: "success",
    message: "Asset deleted successfully",
    data: {
      asset,
    },
  });
});
