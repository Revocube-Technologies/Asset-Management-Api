import { AppError } from "root/src/utils/error";
import prisma from "root/prisma";
import { Request, Response } from "express";
import { generateSerialNumber } from "root/src/utils/function";
import codes from "root/src/utils/statusCode";
import catchAsync from "root/src/utils/catchAsync";
import {generatePaginationQuery, generatePaginationMeta} from "root/src/utils/query";
import {TChangeAssetStatusType, TCreateAssetType, TGetAssetByIdType, TUpdateAssetType, TGetAllAssetsTypes} from "root/src/validation/assetValidator";
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
    imageUrl = `/uploads/${imageFile.filename}`;
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
      createdById: adminId,
    },
    include: {
      location: {
        select: { id: true, name: true },
      },
    },
  });

  res.status(codes.created).json({
    status: "success",
    message: "Asset created successfully",
    data: {
      asset,
    },
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
  let imageUrl: string | undefined = undefined;

  if (imageFile) {
    imageUrl = `/uploads/${imageFile.filename}`;
  }


  const existingAsset = await prisma.asset.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingAsset) {
    throw new AppError(codes.notFound, "Asset not found or already deleted");
  }


  if (locationId) {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true },
    });

    if (!location) {
      throw new AppError(codes.notFound, "Location not found");
    }
  }

  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      name,
      type,
      price,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      locationId,
      notes,
      purchaseType,
      updatedById: adminId,
      ...(imageUrl && { image: imageUrl }),
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset updated successfully",
    data: {
      asset: updatedAsset,
    },
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
    include: {
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
    data: {
      asset,
    },
  });
});


export const changeAssetStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as unknown as TChangeAssetStatusType;
  const adminId = req.admin.id;


  const existingAsset = await prisma.asset.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingAsset) {
    throw new AppError(codes.notFound, "Asset not found or already deleted");
  }


  const asset = await prisma.asset.update({
    where: { id },
    data: {
      status,
      updatedById: adminId,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset status updated successfully",
    data: {
      asset,
    },
  });
});

export const deleteAsset = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.admin?.id;

  const existingAsset = await prisma.asset.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingAsset) {
    throw new AppError(codes.notFound, "Asset not found or already deleted");
  }


  const asset = await prisma.asset.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedById: adminId, 
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Asset deleted successfully",
    data: {
      asset,
    },
  });
});
