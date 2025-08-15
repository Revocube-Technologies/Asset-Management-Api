import * as Yup from 'yup';

export const createDepartmentValidator = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
})

export const getDepartmentValidator = Yup.object().shape({
  id: Yup.string().uuid().required("ID is required").uuid("Invalid ID format"),
});

export const getAllDepartmentValidator = Yup.object().shape({
  page: Yup.number().required("Page number is required"),
  perPage: Yup.number().required("Items per page is required"),
})


export type TCreateDepartmentType = Yup.InferType<typeof createDepartmentValidator>
export type TGetDepartmentType = Yup.InferType<typeof getDepartmentValidator>
export type TGetAllDepartmentType = Yup.InferType<typeof getAllDepartmentValidator>