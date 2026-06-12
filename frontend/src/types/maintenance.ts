import { MaintenanceType } from './enums';
export type MaintenanceRecord = { id: number; vehicleId: number; type: MaintenanceType; items: string[]; cost: number; vendor: string; date: string; nextMileage: number | null; nextDate: string | null; status: 'Scheduled' | 'InProgress' | 'Completed' };

export type UpcomingMaintenanceItem = {
  type: MaintenanceType;
  items: string[];
  nextDate: string | null;
  nextMileage: number | null;
  daysUntil: number | null;
  mileageLeft: number | null;
};
