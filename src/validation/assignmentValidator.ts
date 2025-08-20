import * as Yup from "yup";

export const createAssignmentValidator = Yup.object().shape({
  assetId: Yup.string()
    .uuid()
    .required("Asset ID is required")
    .uuid("Invalid Asset ID format"),
  assignedDate: Yup.date().required("Assigned date is required"),
  employeeName: Yup.string().required("Employee name is required"),
  returnDate: Yup.date().nullable(),
  conditionAtAssignment: Yup.string().nullable(),
  conditionAtReturn: Yup.string().nullable(),
  departmentId: Yup.string()
    .uuid()
    .required("Department ID is required")
    .uuid("Invalid Department ID format"),
});

export const returnAssetValidator = Yup.object().shape({
  assignmentId: Yup.string()
    .uuid()
    .required("Assignment ID is required")
    .uuid("Invalid Assignment ID format"),
  conditionAtReturn: Yup.string().nullable(),
});

export const getAllAssignmentsValidator = Yup.object().shape({
  page: Yup.number().positive("Page number must be positive").default(1),
  perPage: Yup.number().positive("Items per page must be positive").default(15),
});

export type TCreateAssignmentType = Yup.InferType<
  typeof createAssignmentValidator
>;
export type TReturnAssetType = Yup.InferType<typeof returnAssetValidator>;
export type TGetAllAssignmentsType = Yup.InferType<
  typeof getAllAssignmentsValidator
>;
