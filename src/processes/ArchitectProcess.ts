import { ROOM_HEIGHT, ROOM_WIDTH, TERRAIN_WALL } from "../constants";
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface ArchitectMemory {
  room: string;
  baseSpots: Array<{ x: number, y: number }>;
}

const BASE_SIZE = 13;
function flattenRoomIndex(x: number, y: number): number {
  return (x * ROOM_WIDTH) + y;
}

export class ArchitectProcess extends BasicProcess<ArchitectMemory> {
  public static imageName = "Overmind/ArchitectProcess";

  public notify(msg: WombatMessage): void {
    throw new Error("Not implemented yet.");
  }

  private findBaseSpots() {
    this.memory.baseSpots = [];
    const room = Game.rooms[this.memory.room];
    const sqValues: number[][] = [];
    const lookResult = room.lookForAtArea(LOOK_TERRAIN, 0, 0, ROOM_HEIGHT - 1, ROOM_WIDTH - 1, true);
    if (!(lookResult instanceof Array)) {
      return;
    }
    lookResult.sort((a, b) => flattenRoomIndex(a.x, a.y) - flattenRoomIndex(b.x, b.y));

    for (let x = 0; x < ROOM_WIDTH; x++) {
      sqValues[x] = [];
      for (let y = 0; y < ROOM_HEIGHT; y++) {
        if (x === 0
          || y === 0
          || x === (ROOM_WIDTH - 1)
          || y === (ROOM_HEIGHT - 1)
          || lookResult[flattenRoomIndex(x, y)].terrain === TERRAIN_WALL) {
          sqValues[x][y] = 0;
        } else {
          sqValues[x][y] = Math.min(
            sqValues[x - 1][y],
            sqValues[x][y - 1],
            sqValues[x - 1][y - 1]) + 1;
          if (sqValues[x][y] >= BASE_SIZE) {
            this.memory.baseSpots.push({
              x: (x - Math.ceil(BASE_SIZE / 2)),
              y: (y - Math.ceil(BASE_SIZE / 2))
            });
          }
        }
      }
    }
  }

  public run(): void {
    if (this.memory.baseSpots === undefined) {
      this.findBaseSpots();
    } else {
      const viz = new RoomVisual(this.memory.room);
      for (let i = 0; i < this.memory.baseSpots.length; i++) {
        const spot = this.memory.baseSpots[i];
        viz.circle(spot.x, spot.y, { fill: "#FFFFFF" });
      }
    }
  }

}
const FORT_LAYOUT = {
  [STRUCTURE_ROAD as any]: [
    { x: -5, y: -6 },
    { x: -4, y: -6 },
    { x: -3, y: -6 },
    { x: -1, y: -6 },
    { x: 0, y: -6 },
    { x: 1, y: -6 },
    { x: 3, y: -6 },
    { x: 4, y: -6 },
    { x: 5, y: -6 },
    { x: -6, y: -5 },
    { x: -2, y: -5 },
    { x: 2, y: -5 },
    { x: 6, y: -5 },
    { x: -6, y: -4 },
    { x: -3, y: -4 },
    { x: 3, y: -4 },
    { x: 6, y: -4 },
    { x: -6, y: -3 },
    { x: -4, y: -3 },
    { x: 0, y: -3 },
    { x: 4, y: -3 },
    { x: 6, y: -3 },
    { x: -5, y: -2 },
    { x: -1, y: -2 },
    { x: 1, y: -2 },
    { x: 5, y: -2 },
    { x: -6, y: -1 },
    { x: -4, y: -1 },
    { x: -2, y: -1 },
    { x: 2, y: -1 },
    { x: 6, y: -1 },
    { x: -6, y: 0 },
    { x: -3, y: 0 },
    { x: 3, y: 0 },
    { x: 6, y: 0 },
    { x: -6, y: 1 },
    { x: -4, y: 1 },
    { x: -2, y: 1 },
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: -5, y: 2 },
    { x: -1, y: 2 },
    { x: 1, y: 2 },
    { x: 5, y: 2 },
    { x: -6, y: 3 },
    { x: -4, y: 3 },
    { x: 0, y: 3 },
    { x: 4, y: 3 },
    { x: 6, y: 3 },
    { x: -6, y: 4 },
    { x: -3, y: 4 },
    { x: -1, y: 4 },
    { x: 1, y: 4 },
    { x: 3, y: 4 },
    { x: 6, y: 4 },
    { x: -6, y: 5 },
    { x: -2, y: 5 },
    { x: 2, y: 5 },
    { x: 5, y: 5 },
    { x: -5, y: 6 },
    { x: -4, y: 6 },
    { x: -3, y: 6 },
    { x: -1, y: 6 },
    { x: 0, y: 6 },
    { x: 1, y: 6 },
    { x: 3, y: 6 },
    { x: 4, y: 6 },
  ],
  [STRUCTURE_EXTENSION as any]: [
    { x: -2, y: -6 },
    { x: 2, y: -6 },
    { x: -4, y: -5 },
    { x: -3, y: -5 },
    { x: -1, y: -5 },
    { x: 0, y: -5 },
    { x: 1, y: -5 },
    { x: 3, y: -5 },
    { x: 4, y: -5 },
    { x: -5, y: -4 },
    { x: -4, y: -4 },
    { x: -2, y: -4 },
    { x: 0, y: -4 },
    { x: 2, y: -4 },
    { x: 4, y: -4 },
    { x: 5, y: -4 },
    { x: -5, y: -3 },
    { x: -3, y: -3 },
    { x: -2, y: -3 },
    { x: -1, y: -3 },
    { x: 1, y: -3 },
    { x: 2, y: -3 },
    { x: 3, y: -3 },
    { x: 5, y: -3 },
    { x: -6, y: -2 },
    { x: -4, y: -2 },
    { x: -3, y: -2 },
    { x: 3, y: -2 },
    { x: 4, y: -2 },
    { x: 6, y: -2 },
    { x: -5, y: -1 },
    { x: -3, y: -1 },
    { x: 3, y: -1 },
    { x: 5, y: -1 },
    { x: -5, y: 0 },
    { x: -4, y: 0 },
    { x: 4, y: 0 },
    { x: 5, y: 0 },
    { x: -5, y: 1 },
    { x: -3, y: 1 },
    { x: 5, y: 1 },
    { x: -6, y: 2 },
    { x: -4, y: 2 },
    { x: -3, y: 2 },
    { x: 6, y: 2 },
    { x: -5, y: 3 },
    { x: -3, y: 3 },
    { x: -2, y: 3 },
    { x: -1, y: 3 },
    { x: -5, y: 4 },
    { x: -4, y: 4 },
    { x: -2, y: 4 },
    { x: 0, y: 4 },
    { x: -4, y: 5 },
    { x: -3, y: 5 },
    { x: -1, y: 5 },
    { x: 0, y: 5 },
    { x: 1, y: 5 },
    { x: -2, y: 6 },
    { x: 2, y: 6 },
  ],
  [STRUCTURE_POWER_SPAWN as any]: [
    { x: -5, y: -5 },
  ],
  nuker: [
    { x: 5, y: -5 },
  ],
  tower: [
    { x: -2, y: -2 },
    { x: 2, y: -2 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 2 },
  ],
  spawn: [
    { x: 0, y: -2 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
  ],
  storage: [
    { x: 0, y: 0 },
  ],
  link: [
    { x: 0, y: 2 },
  ],
  terminal: [
    { x: 2, y: 2 },
  ],
  lab: [
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 5, y: 3 },
    { x: 2, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
  ],
  observer: [
    { x: -5, y: 5 },
  ]
};
