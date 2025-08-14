import * as Yup from 'yup';
import { paginationValidation } from '.';


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

export const getAllAdminsSchema = Yup.object().shape({}).concat(paginationValidation);

export const getAdminByIdSchema = Yup.object().shape({
   id: Yup.string().uuid().required("ID is required").uuid("Invalid ID format"),
});

export const updateAdminValidator = createAdminValidator.omit(["password", "email"])

export const adminUpdatePasswordSchema = Yup.object().shape({
   oldPassword: Yup.string().min(8).max(13).required("Old password is required"),
   newPassword: Yup.string().min(8).max(13).required("New password is required"),
});


export type TCreateAdminType = Yup.InferType<typeof createAdminValidator>
export type TUpdateAdminType = Yup.InferType<typeof updateAdminValidator>
export type TAdminLoginType = Yup.InferType<typeof adminLoginValidator>
export type TForgotPasswordType = Yup.InferType<typeof forgotPasswordValidator>
export type TResetPasswordType = Yup.InferType<typeof resetPasswordValidator>
export type TGetAllAdminsType = Yup.InferType<typeof getAllAdminsSchema>; 
export type TGetAdminByIdType = Yup.InferType<typeof getAdminByIdSchema>;
export type TAdminUpdatePasswordType = Yup.InferType<typeof adminUpdatePasswordSchema>;