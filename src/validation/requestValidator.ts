import * as Yup from "yup";
import { RequestStatus } from "@prisma/client";

export const createRequestValidator = Yup.object().shape({
  assetId: Yup.string()
    .uuid()
    .required("Asset ID is required")
    .uuid("Invalid Asset ID format"),
  employeeName: Yup.string().required("Employee name is required"),
  departmentId: Yup.string()
    .uuid()
    .required("Department ID is required")
    .uuid("Invalid Department ID format"),
  description: Yup.string().required("Description is required"),
});

export const updateRequestStatusValidator = Yup.object().shape({
  status: Yup.string()
    .oneOf(
      ["Approved", "Declined", "Pending"],
      "Status must be either Approved or Declined"
    )
    .required("Status is required"),
});

export const getAllRequestsValidator = Yup.object().shape({
  page: Yup.number().positive("Page number must be positive").default(1),
  perPage: Yup.number().positive("Items per page must be positive").default(15),
  status: Yup.string()
    .optional()
    .oneOf(Object.values(RequestStatus), "Invalid request status"),
  departmentId: Yup.string().optional().nullable(),
  assetId: Yup.string().optional().nullable(),
  minDate: Yup.string()
    .optional()
    .test("is-date", "Invalid date format", (value) =>
      value ? !isNaN(Date.parse(value)) : true
    ),
  maxDate: Yup.string()
    .optional()
    .test("is-date", "Invalid date format", (value) =>
      value ? !isNaN(Date.parse(value)) : true
    ),
});

export const getRequestByIdValidator = Yup.object().shape({
  id: Yup.string().uuid().required("ID is required").uuid("Invalid ID format"),
});

export type TCreateRequestType = Yup.InferType<typeof createRequestValidator>;
export type TUpdateRequestStatusType = Yup.InferType<
  typeof updateRequestStatusValidator
>;
export type TGetAllRequestsType = Yup.InferType<typeof getAllRequestsValidator>;
export type TGetRequestByIdType = Yup.InferType<typeof getRequestByIdValidator>;
