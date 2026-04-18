import { createDataProvider } from "@buddhi-align/data-access";
import { createAutographService, createModuleAutographStorage } from "@autograph-exchange/core";

const service = createAutographService(createModuleAutographStorage(createDataProvider()));

export const listAutographProfiles = service.listAutographProfiles;
export const upsertAutographProfile = service.upsertAutographProfile;
export const listVisibleAutographRequests = service.listVisibleAutographRequests;
export const createAutographRequest = service.createAutographRequest;
export const signAutographRequest = service.signAutographRequest;
export const autographService = service;
