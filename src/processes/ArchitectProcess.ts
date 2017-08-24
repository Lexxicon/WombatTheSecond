import { ROOM_CENTER, ROOM_HEIGHT, ROOM_WIDTH, TERRAIN_WALL } from "../constants";
import { BasicProcess } from "../kernel/processes/BasicProcess";
import { add, distance, Point, subtract } from "../Points";
import { FORT_LAYOUT } from "./BaseLayout";

export interface ArchitectMemory {
  room: string;
  baseSpots: Point[];
  baseCenter: Point;
}

const BASE_SIZE = FORT_LAYOUT.size;
const HALF_BASE = { x: Math.ceil(BASE_SIZE.x / 2), y: Math.ceil(BASE_SIZE.y / 2) };
const HALF_BASE_DOWN = { x: Math.floor(BASE_SIZE.x / 2), y: Math.floor(BASE_SIZE.y / 2) };

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

  private scoreRoomSpot(x: number, y: number, sqValues: number[][], lookResult: Array<LookAtResultWithPos<"terrain">>) {
    if (isRoomEdge(x, y) || lookResult[roomIndex(x, y)].terrain === TERRAIN_WALL) {
      sqValues[x][y] = 0;
    } else {
      sqValues[x][y] = minAdjacent(x, y, sqValues) + 1;
      if (sqValues[x][y] >= Math.max(BASE_SIZE.x, BASE_SIZE.y)) {
        this.memory.baseSpots.push(subtract({ x, y }, HALF_BASE_DOWN));
      }
    }
  }

  private findBaseSpots() {
    this.memory.baseSpots = [];
    const room = Game.rooms[this.memory.room];
    const sqValues: number[][] = [];
    const lookResult = room.lookForAtArea(LOOK_TERRAIN, 0, 0, ROOM_HEIGHT - 1, ROOM_WIDTH - 1, true);
    if (!Array.isArray(lookResult)) {
      return;
    }
    lookResult.sort((a, b) => roomIndex(a.x, a.y) - roomIndex(b.x, b.y));

    for (let x = 0; x < ROOM_WIDTH; x++) {
      sqValues[x] = [];
      for (let y = 0; y < ROOM_HEIGHT; y++) {
        this.scoreRoomSpot(x, y, sqValues, lookResult);
        const score = Math.floor(Math.min(255, sqValues[x][y] * (255 / 13)));
        let red = (255 - score).toString(16);
        let green = score.toString(16);
        while (red.length < 2) { red = "0" + red; }
        while (green.length < 2) { green = "0" + green; }
        const color = `#${red}${green}00`;
        room.visual.text("" + sqValues[x][y], x, y, { color });
      }
    }
  }

  private findCenter(): Point | undefined {
    if (this.memory.baseSpots === undefined || this.memory.baseSpots.length === 0) {
      return undefined;
    }
    let foundSpot = this.memory.baseSpots[0];
    let rank = distance(foundSpot, ROOM_CENTER);
    if (this.memory.baseSpots.length > 1) {
      for (let i = 0; i < this.memory.baseSpots.length; i++) {
        const testSpot = this.memory.baseSpots[i];
        const testRank = distance(testSpot, ROOM_CENTER);
        if (testRank < rank) {
          foundSpot = testSpot;
          rank = testRank;
        }
      }
    }

    return foundSpot;
  }

  private findCenterWithSpawn(spawn: Point): Point | undefined {
    if (this.memory.baseSpots === undefined || this.memory.baseSpots.length === 0) {
      return undefined;
    }
    for (let i = 0; i < FORT_LAYOUT.spots[STRUCTURE_SPAWN].length; i++) {
      const offset = FORT_LAYOUT.spots[STRUCTURE_SPAWN][i];
      const wantedSpot = { x: spawn.x - offset.x, y: spawn.y - offset.y };
      const foundIndex = _.findIndex(this.memory.baseSpots, wantedSpot);
      if (foundIndex >= 0) {
        return wantedSpot;
      }
    }
    return this.findCenter();
  }

  private findBaseCenter() {
    const mySpawns = Game.rooms[this.memory.room].find<Spawn>(FIND_MY_SPAWNS);
    if (mySpawns.length > 0) {
      const spawnP = mySpawns[0].pos;
      const found = this.findCenterWithSpawn(spawnP);
      if (found) {
        this.memory.baseCenter = found;
      }
    } else {
      const found = this.findCenter();
      if (found) {
        this.memory.baseCenter = found;
      }
    }
  }

  private placeNextSite() {
    const room = Game.rooms[this.memory.room];
    if (room.find(FIND_CONSTRUCTION_SITES).length > 0) {
      return;
    }
    const rcl = room.controller!.level;
    for (const struct in CONTROLLER_STRUCTURES) {
      const cast = struct as StructureConstant;
      const foundStructs = room.find(FIND_MY_STRUCTURES, { filter: { structureType: struct } });
      const c = CONTROLLER_STRUCTURES[STRUCTURE_CONTAINER];
      if (foundStructs.length < CONTROLLER_STRUCTURES[cast][rcl]) {
        const spot = add(FORT_LAYOUT.spots[cast][foundStructs.length], this.memory.baseCenter);
        this.log.info(`building ${struct} at ${JSON.stringify(spot)}`);
        // TODO figure out the off by one
        room.createConstructionSite(spot.x, spot.y, cast);
        return;
      }
    }
  }

  private showBaseLayout() {
    if (this.memory.baseCenter === undefined) {
      return;
    }
    const room = Game.rooms[this.memory.room];

    for (const struct in FORT_LAYOUT.spots) {
      for (let i = 0; i < FORT_LAYOUT.spots[struct].length; i++) {
        const spot = add(FORT_LAYOUT.spots[struct][i], this.memory.baseCenter);
        room.visual.text(struct[0], spot.x, spot.y);
      }
    }
  }

  private showBaseSpots() {
    const viz = new RoomVisual(this.memory.room);
    for (let i = 0; i < this.memory.baseSpots.length; i++) {
      const spot = this.memory.baseSpots[i];
      viz.circle(spot.x, spot.y, { fill: "#FFFFFF" });
    }
    viz.circle(this.memory.baseCenter.x, this.memory.baseCenter.y, { fill: "#FF0000" });
  }

  public run(): void {
    if (this.memory.baseSpots === undefined || this.memory.baseSpots.length === 0) {
      this.log.info("finding base locations");
      this.findBaseSpots();
    } else if (this.memory.baseCenter === undefined) {
      this.log.info("selecting base center");
      this.findBaseCenter();
    } else {
      this.placeNextSite();
    }
  }
}
