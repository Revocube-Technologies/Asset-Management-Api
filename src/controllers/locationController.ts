import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";
import { AppError } from "root/src/utils/error";
import {
  TCreateLocationType,
  TUpdateLocationValidator,
  TGetAllLocationsType,
} from "root/src/validation/locationValidator";
import {
  generatePaginationMeta,
  generatePaginationQuery,
} from "../utils/query";

export const createLocation = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin?.id;

    const { name, address } = req.body as unknown as TCreateLocationType;

    const existingLocation = await prisma.location.findUnique({
      where: { name },
    });

    if (existingLocation) {
      throw new AppError(codes.conflict, "Location already exists");
    }

    const location = await prisma.location.create({
      data: { name, address, createdBy: adminId },
    });

    res.status(codes.created).json({
      status: "success",
      message: "Location created successfully",
      data: location,
    });
  }
);

export const updateLocation = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin.id;

    const { id } = req.params;
    const { name, address } = req.body as unknown as TUpdateLocationValidator;

    const location = await prisma.location.update({
      where: { id },
      data: { name, address, createdBy: adminId },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Location updated successfully",
      data: location,
    });
  }
);

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

  if (!location) {
    throw new AppError(codes.notFound, "Location not found");
  }

  res.status(codes.success).json({
    status: "success",
    message: "Location retrieved successfully",
    data: location,
  });
});

export const getAllLocations = catchAsync(
  async (req: Request, res: Response) => {
    const { page, perPage } = req.validatedQuery as TGetAllLocationsType;

    const totalLocations = await prisma.location.count();

    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      ...generatePaginationQuery({
        page: Number(page),
        perPage: Number(perPage),
      }),
    });

    const pagination = generatePaginationMeta({
      page: Number(page) || 1,
      perPage: Number(perPage),
      count: totalLocations,
    });

    res.status(codes.success).json({
      status: "success",
      ...pagination,
      results: locations.length,
      data: locations,
    });
  }
);

export const deleteLocation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const location = await prisma.location.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.status(codes.noContent).json({
      status: "success",
      message: "Location soft deleted successfully",
      location,
    });
  }
);

