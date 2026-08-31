import { createDataProvider } from "@buddhi-align/data-access";
import { createAutographService, createModuleAutographStorage, AutographService } from "@aartisr/autograph-core";

let _service: AutographService | null = null;
function getService(): AutographService {
  if (!_service) {
    _service = createAutographService(createModuleAutographStorage(createDataProvider()));
  }
  return _service;
}

export const autographService = new Proxy({} as AutographService, {
  get(_, prop) {
    const svc = getService();
    const val = (svc as any)[prop];
    return typeof val === 'function' ? val.bind(svc) : val;
  }
});

export const listAutographProfiles = (...args: Parameters<AutographService['listAutographProfiles']>) => getService().listAutographProfiles(...args);
export const upsertAutographProfile = (...args: Parameters<AutographService['upsertAutographProfile']>) => getService().upsertAutographProfile(...args);
export const listVisibleAutographRequests = (...args: Parameters<AutographService['listVisibleAutographRequests']>) => getService().listVisibleAutographRequests(...args);
export const createAutographRequest = (...args: Parameters<AutographService['createAutographRequest']>) => getService().createAutographRequest(...args);
export const signAutographRequest = (...args: Parameters<AutographService['signAutographRequest']>) => getService().signAutographRequest(...args);
