import { ROOM_HEIGHT, ROOM_WIDTH, TERRAIN_WALL } from "../constants";
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface ArchitectMemory {
  room: string;
  baseSpots: Array<{ x: number, y: number }>;
}

const BASE_SIZE = 13;
const HALF_BASE = Math.ceil(BASE_SIZE / 2);

function roomIndex(x: number, y: number): number {
  return (x * ROOM_WIDTH) + y;
}

function isRoomEdge(x: number, y: number): boolean {
  return x === 0
    || y === 0
    || x === (ROOM_WIDTH - 1)
    || y === (ROOM_HEIGHT - 1);
}

function minAdjacent(x: number, y: number, score: number[][]): number {
  return Math.min(score[x - 1][y], score[x][y - 1], score[x - 1][y - 1]);
}

export class ArchitectProcess extends BasicProcess<ArchitectMemory> {
  public static imageName = "Overmind/ArchitectProcess";

  public notify(msg: WombatMessage): void {
    throw new Error("Not implemented yet.");
  }

  private testRoomSpot(x: number, y: number, sqValues: number[][], lookResult: Array<LookAtResultWithPos<"terrain">>) {
    if (isRoomEdge(x, y) || lookResult[roomIndex(x, y)].terrain === TERRAIN_WALL) {
      sqValues[x][y] = 0;
    } else {
      sqValues[x][y] = minAdjacent(x, y, sqValues) + 1;
      if (sqValues[x][y] >= BASE_SIZE) {
        this.memory.baseSpots.push({ x: (x - HALF_BASE), y: (y - HALF_BASE) });
      }
    }
  }

  private findBaseSpots() {
    this.memory.baseSpots = [];
    const room = Game.rooms[this.memory.room];
    const sqValues: number[][] = [];
    const lookResult = room.lookForAtArea(LOOK_TERRAIN, 0, 0, ROOM_HEIGHT - 1, ROOM_WIDTH - 1, true);
    if (!(lookResult instanceof Array)) {
      return;
    }
    lookResult.sort((a, b) => roomIndex(a.x, a.y) - roomIndex(b.x, b.y));

    for (let x = 0; x < ROOM_WIDTH; x++) {
      sqValues[x] = [];
      for (let y = 0; y < ROOM_HEIGHT; y++) {
        this.testRoomSpot(x, y, sqValues, lookResult);
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
