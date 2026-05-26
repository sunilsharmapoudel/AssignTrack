import { useState, useEffect } from 'react';
import { BatteryInfo } from '../types';
import {
  getBatteryInfo,
  subscribeToBatteryLevel,
  subscribeToBatteryState,
  getBatteryOptimizationTip,
  isLowBattery,
} from '../services/battery/batteryService';

export function useBattery() {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: 1,
    state: 'Unknown',
    lowPowerMode: false,
  });

  useEffect(() => {
    // Initial fetch
    getBatteryInfo().then(setBatteryInfo).catch(() => {});

    // Subscribe to live updates
    const levelSub = subscribeToBatteryLevel((level) =>
      setBatteryInfo((prev) => ({ ...prev, level }))
    );
    const stateSub = subscribeToBatteryState((state) =>
      setBatteryInfo((prev) => ({ ...prev, state }))
    );

    return () => {
      levelSub.remove();
      stateSub.remove();
    };
  }, []);

  return {
    batteryInfo,
    isLow: isLowBattery(batteryInfo.level),
    tip: getBatteryOptimizationTip(batteryInfo),
    percentage: Math.round(batteryInfo.level * 100),
  };
}
