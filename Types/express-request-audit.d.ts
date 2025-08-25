declare module "express-request-audit" {
  import { RequestHandler } from "express";

  interface AuditRequestOptions {
    maskBody?: string[];
    maskHeaders?: string[];
    excludeBody?: string[];
    excludeHeaders?: string[];
  }

  interface AuditResponseOptions {
    excludeBody?: string[];
    maskBody?: string[];
  }

  interface AuditOptions {
    excludeURLs?: string[];
    excludeHeaders?: string[];
    maskBody?: string[];
    maskHeaders?: string[];

    request?: boolean | AuditRequestOptions;
    response?: boolean | AuditResponseOptions;

    [key: string]: any;
  }

  function audit(options?: AuditOptions): RequestHandler;

  export default audit;
}
