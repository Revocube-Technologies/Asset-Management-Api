import * as Yup from 'yup';

export const createDepartmentValidator = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
})

export const getDepartmentValidator = Yup.object().shape({
  id: Yup.string().uuid().required("ID is required").uuid("Invalid ID format"),
});

export const getAllDepartmentsValidator = Yup.object().shape({
  page: Yup.number().positive("Page number must be positive").default(1),
  perPage: Yup.number().positive("Items per page must be positive").default(15),
});

export const updateDepartmentValidator = Yup.object().shape({
  name: Yup.string(),
});


export type TCreateDepartmentType = Yup.InferType<typeof createDepartmentValidator>
export type TGetDepartmentType = Yup.InferType<typeof getDepartmentValidator>
export type TGetAllDepartmentType = Yup.InferType<typeof getAllDepartmentsValidator>
export type TUpdateDepartmentType = Yup.InferType<typeof updateDepartmentValidator>