export const apiPaths = {
  vehicles: '/api/vehicles/',
  drivers: '/api/drivers/',
  dispatch: '/api/dispatch-orders/',
  maintenance: '/api/maintenance-records/',
  maintenancePlan: (vehicleId: number | string) => `/api/maintenance-plan/${vehicleId}/`,
  fuel: '/api/fuel-records/'
} as const;
