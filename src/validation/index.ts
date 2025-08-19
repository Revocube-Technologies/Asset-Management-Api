import * as Yup from "yup";
import { NextFunction, Request, Response } from "express";


type ReqParameter = "body" | "query" | "params";
type ResourceSchema = Yup.Schema | ((request: Request) => Yup.Schema);

const validateRequestParameters =
   (resourceSchema: ResourceSchema, reqParameter: ReqParameter) => async (req: Request, res: Response, next: NextFunction) => {
      try {
         const resource = req[reqParameter];

         const schema = typeof resourceSchema === "function" ? resourceSchema(req) : resourceSchema;

         const parsedResource = await schema.validate(resource, {
            stripUnknown: true,
         });
         req[reqParameter] = parsedResource;
         next();
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
         console.error(e);
         res.status(400).json({ error: e.message });
      }
   };

export default validateRequestParameters;

export const paginationValidation = Yup.object().shape({
   page: Yup.number().positive().default(1),
   perPage: Yup.number().positive().default(15),
});


// import * as Yup from "yup";
// import { NextFunction, Request, Response } from "express";

// type ReqParameter = "body" | "query" | "params";
// type ResourceSchema = Yup.Schema | ((request: Request) => Yup.Schema);

// const validateRequestParameters =
//    (resourceSchema: ResourceSchema, reqParameter: ReqParameter) =>
//    async (req: Request, res: Response, next: NextFunction) => {
//       try {
//          const resource = req[reqParameter];
//          const schema =
//             typeof resourceSchema === "function"
//                ? resourceSchema(req)
//                : resourceSchema;

//          const parsedResource = await schema.validate(resource, {
//             stripUnknown: true,
//          });

//          // ✅ Fix: mutate instead of reassign
//          Object.assign(req[reqParameter], parsedResource);

//          next();
//       } catch (e: any) {
//          console.error(e);
//          res.status(400).json({ error: e.message });
//       }
//    };

// export default validateRequestParameters;

// export const paginationValidation = Yup.object().shape({
//    page: Yup.number().positive().default(1),
//    perPage: Yup.number().positive().default(15),
// });

