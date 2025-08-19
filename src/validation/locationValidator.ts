import * as yup from "yup";

export const createLocationValidator = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
});

export const updateLocationValidator = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
})


export const getAllLocationsValidator = yup.object().shape({
  page: yup.number().positive("Page number must be positive").default(1),
  perPage: yup.number().positive("Items per page must be positive").default(15),
});

export type TCreateLocationType = yup.InferType<typeof createLocationValidator>;

export type TUpdateLocationValidator = yup.InferType<typeof updateLocationValidator>;
export type TGetAllLocationsType = yup.InferType<typeof getAllLocationsValidator>;