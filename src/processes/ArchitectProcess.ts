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
