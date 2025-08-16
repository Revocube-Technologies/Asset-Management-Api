import * as Yup from 'yup';

export const createAssignmentValidator = Yup.object().shape({
  assetId: Yup.string().uuid().required("Asset ID is required").uuid("Invalid Asset ID format"),
  assignedById: Yup.string().uuid().required("Assigned by ID is required").uuid("Invalid Assigned by ID format"),
  assignedDate: Yup.date().required("Assigned date is required"),
  employeeName: Yup.string().required("Employee name is required"),
  returnDate: Yup.date().nullable(),
  conditionAtAssignment: Yup.string().nullable(),
  conditionAtReturn: Yup.string().nullable(),
  departmentId: Yup.string().uuid().required("Department ID is required").uuid("Invalid Department ID format"),
})

export const getAllAssignmentsValidator = Yup.object().shape({
  page: Yup.number().required("Page number is required"),
  perPage: Yup.number().required("Items per page is required"),
})

export const getAssignmentByIdValidator = Yup.object().shape({
  id: Yup.string().uuid().required("ID is required").uuid("Invalid ID format"),
});


export type TCreateAssignmentType = Yup.InferType<typeof createAssignmentValidator>;
export type TGetAllAssignmentsType = Yup.InferType<typeof getAllAssignmentsValidator>;
export type TGetAssignmentByIdType = Yup.InferType<typeof getAssignmentByIdValidator>;