import yup from "yup";


const locationSchema = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
});

export type TCreateLocationType = yup.InferType<typeof locationSchema>;