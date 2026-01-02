import * as migration_20251028_114739 from './20251028_114739';
import * as migration_20251121_060055 from './20251121_060055';
import * as migration_20251202_080759 from './20251202_080759';

export const migrations = [
  {
    up: migration_20251028_114739.up,
    down: migration_20251028_114739.down,
    name: '20251028_114739',
  },
  {
    up: migration_20251121_060055.up,
    down: migration_20251121_060055.down,
    name: '20251121_060055',
  },
  {
    up: migration_20251202_080759.up,
    down: migration_20251202_080759.down,
    name: '20251202_080759'
  },
];
