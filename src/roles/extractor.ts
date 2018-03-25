import { Hive } from "../managers/RoomManager";
import { Role } from "./role";

interface ExtractorMemory {
  sourceID?: string;
  target?: { x: number, y: number, roomName: string };
  state: State;
}

enum State {
  MOVE,
  EXTRACT
}

export class Extractor implements Role<ExtractorMemory> {
  public id = "Extractor";

  public create(spawn: StructureSpawn): string | undefined {
    const rslt = spawn.createCreep([WORK, CARRY], undefined, { role: this.id });
    if (_.isString(rslt)) {
      return rslt;
    }
    return undefined;
  }

  public initMemory(): ExtractorMemory {
    return { sourceID: undefined, state: State.MOVE };
  }

  public run(creep: Creep, memory: ExtractorMemory, hiveMem: Hive): void {
    if (memory.sourceID === undefined) {
      memory.sourceID = this.findSource(creep, hiveMem);
    }
    const source = Game.getObjectById(memory.sourceID) as Source;

    if (memory.target === undefined) {
      memory.target = source.room.lookForAtArea(LOOK_STRUCTURES,
        source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true)
        .map((f) => f.structure)
        .filter((f) => f.structureType === STRUCTURE_CONTAINER)[0].pos;
    }

    if (memory.state === State.MOVE) {
      const pos = new RoomPosition(memory.target.x, memory.target.y, memory.target.roomName);
      if (creep.pos.isEqualTo(pos)) {
        memory.state = State.EXTRACT;
      } else {
        creep.moveTo(pos);
      }
    }

    if (memory.state === State.EXTRACT) {
      creep.harvest(source);
    }
  }

  public findSource(creep: Creep, hiveMem: Hive): string | undefined {
    const source = creep.room.find(FIND_SOURCES)[0];
    const srcMem = hiveMem.roleBoard[this.id];
    if (srcMem.sources === undefined) {
      const srcIDs = creep.room.find(FIND_SOURCES).map((s) => s.id);
      srcMem.sources = {};
      for (const id in srcIDs) {
        srcMem.sources[id] = "";
      }
    }
    let src;
    let ttl;

    for (const srcID in srcMem) {
      const harvesterName = srcMem[srcID] as string;
      if (Game.creeps[harvesterName] === undefined) {
        srcMem[srcID] = creep.name;
        src = srcID;
        break;
      } else {
        if (ttl === undefined || ttl > (Game.creeps[harvesterName].ticksToLive || 0)) {
          ttl = Game.creeps[srcMem[srcID]].ticksToLive;
          src = srcID;
        }
      }
    }

    if (src !== undefined) {
      srcMem[src] = creep.name;
      return src;
    } else {
      return undefined;
    }
  }
}
