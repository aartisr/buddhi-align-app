import { createAutographSignPostHandler } from "@autograph-exchange/core";
import { autographRouteConfig } from "@/app/api/autographs/_config";

export const POST = createAutographSignPostHandler(autographRouteConfig);
