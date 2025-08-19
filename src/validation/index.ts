import * as Yup from "yup";
import { NextFunction, Request, Response } from "express";
import codes from "root/src/utils/statusCode";


declare module "express" {
  interface Request {
    validatedQuery?: any; // Replace `any` with specific types if possible
    validatedBody?: any;
    validatedParams?: any;
  }
}

type ReqParameter = "body" | "query" | "params";
type ResourceSchema = Yup.Schema | ((request: Request) => Yup.Schema);

const validateRequestParameters =
  (resourceSchema: ResourceSchema, reqParameter: ReqParameter) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let resource = req[reqParameter];


      if (reqParameter === "query") {
        resource = Object.fromEntries(
          Object.entries(resource).map(([key, value]) => [
            key,
            typeof value === "string" ? value.replace(/^"|"$/g, "") : value,
          ])
        );
      }

      const schema =
        typeof resourceSchema === "function" ? resourceSchema(req) : resourceSchema;

      const parsedResource = await schema.validate(resource, {
        stripUnknown: true,
        abortEarly: false,
      });


      if (reqParameter === "query") {
        req.validatedQuery = parsedResource;
      } else if (reqParameter === "body") {
        req.validatedBody = parsedResource;
      } else if (reqParameter === "params") {
        req.validatedParams = parsedResource;
      }

      next();
    } catch (e: any) {
      console.error(e);
      res.status(codes.badRequest).json({ error: e.message });
    }
  };

export default validateRequestParameters;

export const paginationValidation = Yup.object().shape({
  page: Yup.number().positive().default(1),
  perPage: Yup.number().positive().default(15),
});