import { Card, Tag } from 'antd';
import type { Vehicle, MaintenanceRecord, UpcomingMaintenanceItem } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useMemo } from 'react';

const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  Routine: '常规保养',
  Repair: '维修',
  Emergency: '紧急维修',
  Inspection: '年检',
};

function getUrgencyLevel(item: UpcomingMaintenanceItem): 'urgent' | 'warning' | 'normal' {
  const days = item.daysUntil;
  const mileage = item.mileageLeft;

  if (days <= 7 || mileage <= 500) {
    return 'urgent';
  }
  if (days <= 30 || mileage <= 3000) {
    return 'warning';
  }
  return 'normal';
}

function getUrgencyColor(level: 'urgent' | 'warning' | 'normal'): string {
  switch (level) {
    case 'urgent':
      return 'red';
    case 'warning':
      return 'orange';
    default:
      return 'blue';
  }
}

function computeUpcomingItems(
  records: MaintenanceRecord[],
  currentMileage: number
): UpcomingMaintenanceItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items: UpcomingMaintenanceItem[] = [];

  for (const record of records) {
    if (!record.nextDate || !record.nextMileage) continue;

    const nextDate = new Date(record.nextDate);
    if (isNaN(nextDate.getTime())) continue;

    const daysUntil = Math.floor(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const mileageLeft = record.nextMileage - currentMileage;

    if (daysUntil <= 30 || mileageLeft <= 3000) {
      items.push({
        type: record.type,
        items: record.items,
        nextDate: record.nextDate,
        nextMileage: record.nextMileage,
        daysUntil,
        mileageLeft,
      });
    }
  }

  items.sort((a, b) => a.daysUntil - b.daysUntil);
  return items;
}

export function VehicleCard({
  vehicle,
  maintenanceRecords,
}: {
  vehicle: Vehicle;
  maintenanceRecords: MaintenanceRecord[];
}) {
  const upcomingItems = useMemo(
    () => computeUpcomingItems(maintenanceRecords, vehicle.mileage),
    [maintenanceRecords, vehicle.mileage]
  );

  const hasUpcoming = upcomingItems.length > 0;

  const mostUrgentLevel = hasUpcoming
    ? upcomingItems.reduce<'urgent' | 'warning' | 'normal'>((prevLevel, item) => {
        const level = getUrgencyLevel(item);
        if (prevLevel === 'urgent' || level === 'urgent') return 'urgent';
        if (prevLevel === 'warning' || level === 'warning') return 'warning';
        return 'normal';
      }, 'normal')
    : null;

  return (
    <Card
      size="small"
      title={
        <div className="flex items-center justify-between">
          <span>{vehicle.plateNo}</span>
          <StatusBadge status={vehicle.status} />
        </div>
      }
      style={{ height: '100%' }}
    >
      <div className="space-y-2">
        <p className="text-gray-600 text-sm">{vehicle.brandModel}</p>
        <p className="text-gray-600 text-sm">里程：{vehicle.mileage.toLocaleString()} km</p>

        <div className="pt-2 border-t border-gray-100">
          {hasUpcoming ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Tag color={getUrgencyColor(mostUrgentLevel!)} style={{ margin: 0 }}>
                  保养提醒
                </Tag>
              </div>

              {upcomingItems.slice(0, 2).map((item, index) => {
                const level = getUrgencyLevel(item);
                return (
                  <div key={index} className="text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <Tag
                        color={getUrgencyColor(level)}
                        style={{ margin: 0, padding: '0 6px' }}
                      >
                        {MAINTENANCE_TYPE_LABELS[item.type] || item.type}
                      </Tag>
                      <span className="text-gray-500">{item.items.join('、')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 pl-1">
                      <span>
                        {item.daysUntil > 0
                          ? `还有 ${item.daysUntil} 天`
                          : item.daysUntil === 0
                          ? '今天到期'
                          : `已逾期 ${Math.abs(item.daysUntil)} 天`}
                      </span>
                      <span>
                        剩余 {item.mileageLeft > 0 ? `${item.mileageLeft.toLocaleString()} km` : '已超里程'}
                      </span>
                    </div>
                    <div className="text-gray-400 pl-1">
                      下次保养：{item.nextDate}
                    </div>
                  </div>
                );
              })}

              {upcomingItems.length > 2 && (
                <div className="text-xs text-gray-400 pl-1">
                  还有 {upcomingItems.length - 2} 项待保养...
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400">暂无即将到期的保养</div>
          )}
        </div>
      </div>
    </Card>
  );
}
