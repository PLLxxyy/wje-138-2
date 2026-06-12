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

  const isUrgent = (days !== null && days <= 7) || (mileage !== null && mileage <= 500);
  if (isUrgent) return 'urgent';

  const isWarning = (days !== null && days <= 30) || (mileage !== null && mileage <= 3000);
  if (isWarning) return 'warning';

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

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function computeDaysUntil(nextDate: Date | null): number | null {
  if (!nextDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isDateTrigger(daysUntil: number | null): boolean {
  return daysUntil !== null && daysUntil <= 30;
}

function isMileageTrigger(mileageLeft: number | null): boolean {
  return mileageLeft !== null && mileageLeft <= 3000;
}

function computeMileageLeft(
  nextMileage: number | null | undefined,
  currentMileage: number
): number | null {
  if (nextMileage === null || nextMileage === undefined) return null;
  if (!currentMileage && currentMileage !== 0) return null;
  return nextMileage - currentMileage;
}

function computeUpcomingItems(
  records: MaintenanceRecord[],
  currentMileage: number
): UpcomingMaintenanceItem[] {
  const items: UpcomingMaintenanceItem[] = [];

  for (const record of records) {
    const rawNextDate = record.nextDate ?? null;
    const parsedDate = parseDate(rawNextDate);
    const daysUntil = computeDaysUntil(parsedDate);
    const rawNextMileage = record.nextMileage;
    const nextMileageValue: number | null =
      rawNextMileage === null || rawNextMileage === undefined ? null : rawNextMileage;
    const mileageLeft = computeMileageLeft(nextMileageValue, currentMileage);

    if (!isDateTrigger(daysUntil) && !isMileageTrigger(mileageLeft)) continue;

    const validNextDate: string | null = parsedDate && rawNextDate ? rawNextDate : null;

    items.push({
      type: record.type,
      items: record.items,
      nextDate: validNextDate,
      nextMileage: nextMileageValue,
      daysUntil,
      mileageLeft,
    });
  }

  items.sort((a, b) => {
    const aDays = a.daysUntil ?? 9999;
    const bDays = b.daysUntil ?? 9999;
    return aDays - bDays;
  });
  return items;
}

function formatDaysText(daysUntil: number | null): string | null {
  if (daysUntil === null) return null;
  if (daysUntil > 0) return `还有 ${daysUntil} 天`;
  if (daysUntil === 0) return '今天到期';
  return `已逾期 ${Math.abs(daysUntil)} 天`;
}

function formatMileageText(mileageLeft: number | null): string | null {
  if (mileageLeft === null) return null;
  if (mileageLeft > 0) return `剩余 ${mileageLeft.toLocaleString()} km`;
  return '已超里程';
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
                const daysText = formatDaysText(item.daysUntil);
                const mileageText = formatMileageText(item.mileageLeft);

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
                      {daysText && <span>{daysText}</span>}
                      {mileageText && <span>{mileageText}</span>}
                    </div>
                    {(item.nextDate || item.nextMileage) && (
                      <div className="text-gray-400 pl-1 flex items-center gap-3">
                        {item.nextDate && <span>下次保养：{item.nextDate}</span>}
                        {item.nextMileage !== null && (
                          <span>保养里程：{item.nextMileage.toLocaleString()} km</span>
                        )}
                      </div>
                    )}
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
