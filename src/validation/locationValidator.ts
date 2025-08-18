import * as yup from "yup";


export const createLocationValidator = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
});

export const updateLocationValidator = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
})

export type TCreateLocationType = yup.InferType<typeof createLocationValidator>;

export type TUpdateLocationValidator = yup.InferType<typeof updateLocationValidator>;