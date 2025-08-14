import dotenv from "dotenv";
dotenv.config();
import * as Yup from "yup";

const envSchema = Yup.object({
   APP_NAME: Yup.string().required(),
   APP_EMAIL: Yup.string().email().required(),
   PORT: Yup.number().default(3310),

   DATABASE_URL: Yup.string().required(),

   NODE_ENV: Yup.string().oneOf(["development", "production"]).default("development"),

   JWT_SECRET: Yup.string().required(),
   JWT_TOKEN_EXPIRES: Yup.string().default("1d"),
   JWT_COOKIE_EXPIRES: Yup.string().default("1d"),

   FRONTEND_URL: Yup.string().url(),

   EMAIL_HOST: Yup.string().required(),
   EMAIL_PORT: Yup.number().required(),
   EMAIL_USER: Yup.string().required(),
   EMAIL_PASS: Yup.string().required(),

   AWS_REGION: Yup.string().required(),
   AWS_BUCKET_NAME: Yup.string().required(),
   AWS_ENDPOINT: Yup.string().required(),
   AWS_ACCESS_KEY: Yup.string().required(),
   AWS_SECRET_KEY: Yup.string().required(),

   IMAGE_URL: Yup.string().required(),
   X_URL: Yup.string().required(),
   FACEBOOK_URL: Yup.string().required(),
   INSTAGRAM_URL: Yup.string().required(),
   LINKEDIN_URL: Yup.string().required(),
   UNSUBSCRIBE_URL: Yup.string().required(),
}).noUnknown(true);

const envVars = envSchema.validateSync(process.env, {
   stripUnknown: true,
   abortEarly: false,
});

const config = {
   nodeEnv: envVars.NODE_ENV,

   port: envVars.PORT,

   appName: envVars.APP_NAME,
   appEmail: envVars.APP_EMAIL,

   jwtSecret: envVars.JWT_SECRET,
   jwtTokenExpires: envVars.JWT_TOKEN_EXPIRES,
   jwtCookieExpires: envVars.JWT_COOKIE_EXPIRES,
   frontendUrl: envVars.FRONTEND_URL,

   emailHost: envVars.EMAIL_HOST,
   emailPort: envVars.EMAIL_PORT,
   emailUser: envVars.EMAIL_USER,
   emailPass: envVars.EMAIL_PASS,

   awsRegion: envVars.AWS_REGION,
   awsBucketName: envVars.AWS_BUCKET_NAME,
   awsEndpoint: envVars.AWS_ENDPOINT,
   awsAccessKey: envVars.AWS_ACCESS_KEY,
   awsSecretKey: envVars.AWS_SECRET_KEY,

   imageUrl: envVars.IMAGE_URL,
   xUrl: envVars.X_URL,
   facebookUrl: envVars.FACEBOOK_URL,
   instagramUrl: envVars.INSTAGRAM_URL,
   linkedinUrl: envVars.LINKEDIN_URL,
   unsubscribeUrl: envVars.UNSUBSCRIBE_URL,
};

export default config;
