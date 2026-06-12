import { Card, Tag, Spin } from 'antd';
import { useEffect, useState } from 'react';
import type { Vehicle, MaintenancePlan, UpcomingMaintenanceItem } from '../../types';
import { StatusBadge } from './StatusBadge';
import { maintenanceApi } from '../../api/maintenance';

const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  Routine: '常规保养',
  Repair: '维修',
  Emergency: '紧急维修',
  Inspection: '年检',
};

function getUrgencyLevel(item: UpcomingMaintenanceItem): 'urgent' | 'warning' | 'normal' {
  const days = item.daysUntil;
  const mileage = item.mileageLeft;

  if ((days !== null && days <= 7) || (mileage !== null && mileage <= 500)) {
    return 'urgent';
  }
  if ((days !== null && days <= 30) || (mileage !== null && mileage <= 3000)) {
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '暂无';
  return dateStr;
}

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [plan, setPlan] = useState<MaintenancePlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    maintenanceApi.getPlan(vehicle.id)
      .then(setPlan)
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [vehicle.id]);

  const upcomingItems = plan?.upcomingItems ?? [];
  const hasUpcoming = upcomingItems.length > 0;

  const mostUrgentLevel = hasUpcoming
    ? upcomingItems.reduce((prevLevel, item) => {
        const level = getUrgencyLevel(item);
        if (prevLevel === 'urgent' || level === 'urgent') return 'urgent';
        if (prevLevel === 'warning' || level === 'warning') return 'warning';
        return 'normal';
      }, 'normal' as 'urgent' | 'warning' | 'normal')
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
          {loading ? (
            <div className="flex justify-center py-2">
              <Spin size="small" />
            </div>
          ) : hasUpcoming ? (
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
                      <Tag color={getUrgencyColor(level)} style={{ margin: 0, padding: '0 6px' }}>
                        {MAINTENANCE_TYPE_LABELS[item.type] || item.type}
                      </Tag>
                      <span className="text-gray-500">{item.items.join('、')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 pl-1">
                      {item.daysUntil !== null && (
                        <span>
                          {item.daysUntil > 0
                            ? `还有 ${item.daysUntil} 天`
                            : item.daysUntil === 0
                            ? '今天到期'
                            : `已逾期 ${Math.abs(item.daysUntil)} 天`}
                        </span>
                      )}
                      {item.mileageLeft !== null && (
                        <span>
                          剩余 {item.mileageLeft > 0 ? `${item.mileageLeft.toLocaleString()} km` : '已超里程'}
                        </span>
                      )}
                    </div>
                    {item.nextDate && (
                      <div className="text-gray-400 pl-1">
                        下次保养：{formatDate(item.nextDate)}
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
            <div className="text-xs text-gray-400">
              暂无即将到期的保养
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
