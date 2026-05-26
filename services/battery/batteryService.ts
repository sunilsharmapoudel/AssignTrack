import * as Battery from 'expo-battery';
import { Platform } from 'react-native';
import { BatteryInfo } from '../../types';
import { LOW_BATTERY_THRESHOLD } from '../../constants/config';

const noopSubscription: Battery.Subscription = { remove: () => {} };

function stateToString(state: Battery.BatteryState): string {
  switch (state) {
    case Battery.BatteryState.CHARGING:   return 'Charging';
    case Battery.BatteryState.FULL:       return 'Full';
    case Battery.BatteryState.UNPLUGGED:  return 'Unplugged';
    default:                              return 'Unknown';
  }
}

export async function getBatteryInfo(): Promise<BatteryInfo> {
  const [level, state, lowPowerMode] = await Promise.all([
    Battery.getBatteryLevelAsync(),
    Battery.getBatteryStateAsync(),
    Battery.isLowPowerModeEnabledAsync(),
  ]);

  return {
    level,
    state: stateToString(state),
    lowPowerMode,
  };
}

export function isLowBattery(level: number): boolean {
  return level <= LOW_BATTERY_THRESHOLD;
}

// Returns a suggestion string based on battery state
export function getBatteryOptimizationTip(info: BatteryInfo): string {
  if (info.lowPowerMode) return 'Low Power Mode is ON — background sync is paused.';
  if (isLowBattery(info.level)) return 'Battery low — consider enabling Low Power Mode.';
  if (info.state === 'Charging') return 'Charging — all features are fully active.';
  return 'Battery is sufficient for full operation.';
}

export function subscribeToBatteryLevel(
  callback: (level: number) => void
): Battery.Subscription {
  if (Platform.OS === 'web') return noopSubscription;
  return Battery.addBatteryLevelListener(({ batteryLevel }) => callback(batteryLevel));
}

export function subscribeToBatteryState(
  callback: (state: string) => void
): Battery.Subscription {
  if (Platform.OS === 'web') return noopSubscription;
  return Battery.addBatteryStateListener(({ batteryState }) =>
    callback(stateToString(batteryState))
  );
}
