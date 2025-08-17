import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { AppError } from "root/src/utils/error";
import { TCreateLocationType, TUpdateLocationValidator } from "root/src/validation/locationValidator";

export const createLocation = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin?.id;

    const { name, address } = req.body as unknown as TCreateLocationType;

    if (!name) {
      throw new AppError(codes.badRequest, "Location name is required");
    }

    const existingLocation = await prisma.location.findUnique({
      where: { name },
    });

    if (existingLocation) {
      throw new AppError(codes.conflict, "Location already exists");
    }

    const location = await prisma.location.create({
      data: { name, address },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Location created successfully",
      data: location,
    });
  }
);

export const updateLocation = catchAsync( async (req: Request, res: Response) => {
  const adminId = req.admin?.id;

  const {id } = req.params as unknown as TUpdateLocationValidator;
  const {name, address } = req.body as unknown as TUpdateLocationValidator;

  const location = await prisma.location.update({
    where: { id },
    data: { name, address },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Location updated successfully",
    data: location,
  });
});


export const getLocation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const location = await prisma.location.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Location retrieved successfully",
    data: location,
  });
});

export const deleteLocation = catchAsync( async(req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.location.delete({
    where: { id },
  });

  res.status(codes.success).json({
    status: "success",
    message: "Location deleted successfully",
  });
})







