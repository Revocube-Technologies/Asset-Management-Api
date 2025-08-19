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


// export const getAllDepartmentValidator = Yup.object().shape({
//   page: Yup.number()
//     .transform((value, originalValue) => Number(originalValue)) 
//     .required("Page number is required")
//     .min(1, "Page must be at least 1"),
//   perPage: Yup.number()
//     .transform((value, originalValue) => Number(originalValue)) 
//     .required("Items per page is required")
//     .min(1, "Items per page must be at least 1"),
// });

export const updateDepartmentValidator = Yup.object().shape({
  name: Yup.string(),
});


export type TCreateDepartmentType = Yup.InferType<typeof createDepartmentValidator>
export type TGetDepartmentType = Yup.InferType<typeof getDepartmentValidator>
export type TGetAllDepartmentType = Yup.InferType<typeof getAllDepartmentValidator>
export type TUpdateDepartmentType = Yup.InferType<typeof updateDepartmentValidator>