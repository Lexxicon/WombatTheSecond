interface MineMemory {
  deliverRoom: string;
  harvestRoom: string;
}

interface HarvestSite {
  harvestID: string;
  harvestPosition: { x: number, y: number };
  replacementTime: number;
  distanceToDropOff: number;
}
