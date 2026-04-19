import {
  createAutographProfilesGetHandler,
  createAutographProfilesPutHandler,
} from "@aartisr/autograph-core";
import { autographRouteConfig } from "../_config";

export const GET = createAutographProfilesGetHandler(autographRouteConfig);
export const PUT = createAutographProfilesPutHandler(autographRouteConfig);
