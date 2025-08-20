import { RepairStatus } from "@prisma/client";
import * as Yup from "yup";

export const logRepairValidator = Yup.object().shape({
  description: Yup.string().required("Description is required"),
  repairCost: Yup.number().required("Repair cost is required"),
  repairedBy: Yup.string().required("Repaired by is required"),
  requestLogId: Yup.string()
    .uuid()
    .required("Request ID is required")
    .uuid("Invalid Request ID format"),
});

export const completeRepairValidator = Yup.object().shape({
  remarks: Yup.string().nullable(),
});

export const getRepairByIdValidator = Yup.object().shape({
  id: Yup.string()
    .uuid()
    .required("Repair ID is required")
    .uuid("Invalid Repair ID format"),
});

export const getRepairsValidator = Yup.object().shape({
  page: Yup.number().positive("Page number must be positive").default(1),
  perPage: Yup.number().positive("Items per page must be positive").default(15),
  status: Yup.mixed<RepairStatus>()
    .optional()
    .oneOf(Object.values(RepairStatus), "Invalid repair status"),
});

export type TLogRepairType = Yup.InferType<typeof logRepairValidator>;
export type TCompleteRepairType = Yup.InferType<typeof completeRepairValidator>;
export type TGetRepairsType = Yup.InferType<typeof getRepairsValidator>;
export type TGetRepairByIdType = Yup.InferType<typeof getRepairByIdValidator>;
