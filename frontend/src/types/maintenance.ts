import { MaintenanceType } from './enums';
export type MaintenanceRecord = { id: number; vehicleId: number; type: MaintenanceType; items: string[]; cost: number; vendor: string; date: string; nextMileage: number; nextDate: string; status: 'Scheduled' | 'InProgress' | 'Completed' };

export type UpcomingMaintenanceItem = {
  type: MaintenanceType;
  items: string[];
  nextDate: string;
  nextMileage: number;
  daysUntil: number;
  mileageLeft: number;
};
