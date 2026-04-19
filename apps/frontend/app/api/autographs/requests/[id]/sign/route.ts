import { createAutographSignPostHandler } from "@aartisr/autograph-core";
import { autographRouteConfig } from "@/app/api/autographs/_config";

export const POST = createAutographSignPostHandler(autographRouteConfig);
