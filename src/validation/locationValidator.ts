import yup from "yup";


const createLocationValidator = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
});

const updateLocationValidator = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required(),
  address: yup.string().required(),
})

export type TCreateLocationType = yup.InferType<typeof createLocationValidator>;

export type TUpdateLocationValidator = yup.InferType<typeof updateLocationValidator>;