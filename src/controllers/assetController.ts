import { Asset, Admin, purchaseStatus } from "@prisma/client";
import { AppError } from "root/src/utils/error";
import config from "root/src/config/env";
import prisma from "root/prisma";
import { Request, Response } from "express";
import uploadImageToCloudinary from "root/src/service/imageUploadService";
import { generateSerialNumber } from "root/src/utils/function";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";

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
      status: "available",
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

export const getAllItems = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(403, "Unauthorized");

  const items = await prisma.item.findMany();
  res.status(200).json({ status: "success", items });
};

export const updateItemQuantity = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  const user = await User.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(403, "Unauthorized");

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new AppError(404, "Item not found");

  const updatedItem = await Item.update({
    where: { id },
    data: { quantity },
  });

  await prisma.log.create({
    data: {
      action: "UPDATE",
      details: `Updated quantity of item: ${item.name}`,
      itemId: id,
      storeId: item.storeId,
      quantity,
    },
  });

  res.status(200).json({ status: "success", updatedItem });
};
