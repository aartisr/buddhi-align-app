import {
  createAutographRequestsGetHandler,
  createAutographRequestsPostHandler,
} from "@autograph-exchange/core";
import { autographRouteConfig } from "../_config";

export const GET = createAutographRequestsGetHandler(autographRouteConfig);
export const POST = createAutographRequestsPostHandler(autographRouteConfig);
