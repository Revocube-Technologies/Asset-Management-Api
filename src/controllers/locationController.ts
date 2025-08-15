import prisma from "root/prisma";
import { Request, Response } from "express";
import codes from "../utils/statusCode";
import catchAsync from "../utils/catchAsync";

export const createLocation = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.admin?.id;

    const { name } = req.body;

    const location = await prisma.location.create({
      data: {
        name,
      },
    });

    res.status(codes.success).json({
      status: "success",
      message: "Location created successfully",
      data: location,
    });
  }
);
