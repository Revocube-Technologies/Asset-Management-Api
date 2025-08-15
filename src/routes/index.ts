import express from "express";
import authRouter from "./authRouter";
import assetRouter from "./assetRouter";
import roleRouter from "./roleRouter";

const adminRouter = express.Router();

adminRouter.use("/auth", authRouter);
adminRouter.use("/assets", assetRouter);
adminRouter.use("/roles", roleRouter);


export default adminRouter;
