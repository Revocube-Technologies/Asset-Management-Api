import * as Yup from 'yup';

export const getAdminValidator = Yup.object().shape({
  search: Yup.string(),
  page: Yup.number().default(1).positive(),
  perPage: Yup.number().default(15).positive(),
})

export const createAdminValidator = Yup.object().shape({
  firstName: Yup.string().required("Admin first name is required"),
  lastName: Yup.string().required("Admin last name is required"),
  email: Yup.string().email("Please provide a valid email").required("Admin email is required"),
  phoneNumber: Yup.string().matches(
    /^\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/,
    "Phone number must be in international format"
  ).required("Admin phone number is required"),
  password: Yup.string().required("Admin password is required"),
  roleId: Yup.string().required("Admin role is required"),
  storeId: Yup.string().required("Admin store name is required"),
  permissions: Yup.array().of(Yup.string().required())
})

export const updateAdminStatusValidator = Yup.object().shape({
  isEnabled: Yup.boolean().required("Status is required")
})

export const adminLoginValidator = Yup.object().shape({
  email: Yup.string().email("Please provide a valid email").required("Admin email is required"),
  password: Yup.string().required("Admin password is required"),
})

export const forgotPasswordValidator = Yup.object().shape({
  email: Yup.string().email("Please provide a valid email").required("Admin email is required"),
});

export const resetPasswordValidator = Yup.object().shape({
  token: Yup.string().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Passwords must match").required(),
});

export const updateAdminValidator = createAdminValidator.omit(["password", "email"])

export type GetAdminType = Yup.InferType<typeof getAdminValidator>
export type CreateAdminType = Yup.InferType<typeof createAdminValidator>
export type UpdateAdminType = Yup.InferType<typeof updateAdminValidator>
export type UpdateAdminStatusType = Yup.InferType<typeof updateAdminStatusValidator>
export type AdminLoginType = Yup.InferType<typeof adminLoginValidator>
export type ForgotPasswordType = Yup.InferType<typeof forgotPasswordValidator>
export type ResetPasswordType = Yup.InferType<typeof resetPasswordValidator> 