import audit from "express-request-audit";
import jwt from "jsonwebtoken";
import prisma from "root/prisma";
import config from "root/src/config/env";

const secret = config.jwtSecret;

const auditLogMiddleware = audit({
  auditor: async (event: any) => {
    try {
      const { request, response } = event;

      const {
        method,
        url_route: urlRoute,
        url,
        url_params: urlParams,
        ip: ipAddress,
        body: requestBody,
        query,
        headers,
      } = request;
      const { body: responseBody, elapsed } = response;


      if (method === "GET") return;


      const authorization = headers?.authorization;
      const admin = authorization
        ? (jwt.verify(authorization.replace("Bearer ", ""), secret) as {
            id: string;
            email: string;
            role: string;
          })
        : undefined;


      if (!admin?.id) {
        return;
      }


      const adminAction = { method, urlRoute, url };
      const requestData = { urlParams, requestBody, query };


      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          ipAddress,
          action: adminAction,
          request: requestData,
          response: JSON.parse(responseBody),
          timeElapsed: elapsed,
        },
      });
    } catch (error: any) {
      console.error("Audit log error:", error);
    }
  },
  request: {
    maskBody: ["password"],
  },
  response: {
    excludeBody: ["password", "otp"],
  },
});

export default auditLogMiddleware;
