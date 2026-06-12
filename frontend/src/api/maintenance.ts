import { request } from '../utils/request';
import { apiPaths } from '../constants/apiPaths';
import type { MaintenancePlan } from '../types';
export const maintenanceApi = {
  list: <T>() => request<T[]>(apiPaths.maintenance),
  getPlan: (vehicleId: number | string) => request<MaintenancePlan>(apiPaths.maintenancePlan(vehicleId)),
};
