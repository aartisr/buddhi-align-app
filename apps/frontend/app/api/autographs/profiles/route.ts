import {
  createAutographProfilesGetHandler,
  createAutographProfilesPutHandler,
} from "@autograph-exchange/core";
import { autographRouteConfig } from "../_config";

export const GET = createAutographProfilesGetHandler(autographRouteConfig);
export const PUT = createAutographProfilesPutHandler(autographRouteConfig);
