import {
  createAutographRequestsGetHandler,
  createAutographRequestsPostHandler,
} from "@aartisr/autograph-core";
import { autographRouteConfig } from "../_config";

export const GET = createAutographRequestsGetHandler(autographRouteConfig);
export const POST = createAutographRequestsPostHandler(autographRouteConfig);
