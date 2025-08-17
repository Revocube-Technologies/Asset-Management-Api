import express from "express";
import authRouter from "./authRouter";
import assetRouter from "./assetRouter";
import roleRouter from "./roleRouter";
import assignmentRouter from "./assignmentRouter";
import departmentRouter from "./departmentRouter";
import locationRouter from "./locationRouter";

const adminRouter = express.Router();

adminRouter.use("/auth", authRouter);
adminRouter.use("/assets", assetRouter);
adminRouter.use("/roles", roleRouter);
adminRouter.use("/assign", assignmentRouter);
adminRouter.use("/department", departmentRouter);
adminRouter.use("/location", locationRouter);

export default adminRouter;
