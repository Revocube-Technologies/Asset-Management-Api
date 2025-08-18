import * as Yup from 'yup';

export const createRequestValidator = Yup.object().shape({
  assetId: Yup.string().uuid().required("Asset ID is required").uuid("Invalid Asset ID format"),
  employeeName: Yup.string().required("Employee name is required"),
  departmentId: Yup.string().uuid().required("Department ID is required").uuid("Invalid Department ID format"),
  description: Yup.string().required("Description is required"),
})

export const updateRequestStatusValidator = Yup.object().shape({
  status: Yup.string()
    .oneOf(["Approved", "Declined", "Pending"], "Status must be either Approved or Declined")
    .required("Status is required"),
  })

export const getAllRequestsValidator = Yup.object().shape({
  page: Yup.number().required(),
  perPage: Yup.number().required(),
  status: Yup.string().required(),
  departmentId: Yup.string().nullable(),
  assetId: Yup.string().nullable(),
  minDate: Yup.string().nullable(),
  maxDate: Yup.string().nullable(),
})



export type TCreateRequestType = Yup.InferType<typeof createRequestValidator>;
export type TUpdateRequestStatusType = Yup.InferType<typeof updateRequestStatusValidator>;
export type TGetAllRequestsType = Yup.InferType<typeof getAllRequestsValidator>;