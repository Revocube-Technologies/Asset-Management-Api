import * as Yup from 'yup';

export const createRequestValidator = Yup.object().shape({
  assetId: Yup.string().uuid().required("Asset ID is required").uuid("Invalid Asset ID format"),
  employeeName: Yup.string().required("Employee name is required"),
  departmentId: Yup.string().uuid().required("Department ID is required").uuid("Invalid Department ID format"),
  description: Yup.string().required("Description is required"),
})

export type TCreateRequestType = Yup.InferType<typeof createRequestValidator>;