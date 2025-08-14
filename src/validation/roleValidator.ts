import * as Yup from "yup";

export const createRoleValidator = Yup.object().shape({
   name: Yup.string().required("Role name is required"),
   permissions: Yup.array()
      .min(1, "At least one permission is required for a role")
      .of(Yup.string().required())
      .required("Role permission is required"),
});

export const updateRoleValidator = createRoleValidator;

export type CreateRoleType = Yup.InferType<typeof createRoleValidator>;
export type UpdateRoleType = Yup.InferType<typeof updateRoleValidator>;
