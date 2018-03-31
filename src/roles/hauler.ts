import { Hive } from "../managers/RoomManager";
import { Role } from "./role";

interface HaulerMemory {
  state: State;
  destination?: { x: number, y: number, roomName: string };
}

enum State {
  PICKUP,
  DROPOFF
}
const NON_FULL_TOWER = {
  filter: (f: AnyStructure) => f.structureType === STRUCTURE_TOWER && f.energy < f.energyCapacity
};

export class Hauler implements Role<HaulerMemory> {
  public id = "HAUlER";

  public create(spawn: StructureSpawn): string | undefined {
    let size = Math.min(spawn.room.energyAvailable / (BODYPART_COST[MOVE] + BODYPART_COST[CARRY]), 10);
    const body: BodyPartConstant[] = [];
    while (size > 0) {
      size--;
      body.push(CARRY, MOVE);
    }
    const rslt = spawn.createCreep(body, undefined, { role: this.id });
    if (_.isString(rslt)) {
      return rslt;
    }
    return undefined;
  }

  public initMemory(): HaulerMemory {
    return { state: State.PICKUP };
  }

  public run(creep: Creep, memory: HaulerMemory, hive: Hive): void {
    if (memory.destination === undefined) {
      memory.destination = this.findDestination(creep, memory, hive);
    }

    const pos = new RoomPosition(memory.destination.x, memory.destination.y, memory.destination.roomName);
    const struct = (pos.lookFor(LOOK_STRUCTURES)[0] || pos.lookFor(LOOK_TOMBSTONES)[0]);

    if (memory.state === State.PICKUP) {
      const pile = pos.lookFor(LOOK_ENERGY)[0];
      if ((pile && creep.pickup(pile) === ERR_NOT_IN_RANGE)
        || creep.withdraw(struct, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(pos);
      } else {
        if (creep.carry.energy === creep.carryCapacity) {
          memory.state = State.DROPOFF;
        }
        memory.destination = this.findDestination(creep, memory, hive);
      }
      return;
    }

    if (memory.state === State.DROPOFF) {
      if (creep.transfer(struct, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(pos);
      } else {
        if (creep.carry.energy === 0) {
          if (creep.ticksToLive && creep.ticksToLive < 100) {
            creep.suicide();
          }
          memory.state = State.PICKUP;
        }
        memory.destination = this.findDestination(creep, memory, hive);
      }
      return;
    }
  }

  private findDestination(creep: Creep, memory: HaulerMemory, hive: Hive): { x: number, y: number, roomName: string } {
    if (memory.state === State.PICKUP) {
      const found = hive.harvestSpots
        .map((f) => f.lookFor(LOOK_STRUCTURES)[0])
        .filter((f) => f !== undefined && f.structureType === STRUCTURE_CONTAINER)
        .map((f) => ({
          amount: (f as StructureContainer).store.energy,
          pos: f.pos
        }));

      const piles = creep.room.find(FIND_DROPPED_RESOURCES, { filter: (f) => f.resourceType === RESOURCE_ENERGY });
      found.push(...piles);
      const tomb = creep.room.find(FIND_TOMBSTONES).map((f) => ({ amount: f.store.energy, pos: f.pos }));
      found.push(...tomb);
      return found.reduce((a, b) => a.amount > b.amount ? a : b).pos;
    }

    if (memory.state === State.DROPOFF) {
      if (hive.homeRoom.energyAvailable < hive.homeRoom.energyCapacityAvailable) {
        return this.findSpawnRefill(creep);
      }

      const towers = hive.homeRoom.find(FIND_STRUCTURES, NON_FULL_TOWER) as StructureTower[];
      if (towers.length > 0) {
        return towers[0].pos;
      }

      const upgrade = hive.upgradeSpot.lookFor(LOOK_STRUCTURES)[0] as StructureContainer;
      if (upgrade.store.energy < upgrade.storeCapacity) {
        return upgrade.pos;
      }

      if (hive.homeRoom.storage) {
        return hive.homeRoom.storage.pos;
      }
    }
    return { x: 0, y: 0, roomName: "" };
  }

  private findSpawnRefill(creep: Creep) {
    const spawns = creep.room.find(FIND_MY_SPAWNS, { filter: (s) => s.energy < s.energyCapacity });
    let fillTarget = { x: 0, y: 0, roomName: "" };
    if (spawns.length > 0) {
      fillTarget = spawns[0].pos;
    } else {
      const extensions = creep.pos.findClosestByRange(FIND_MY_STRUCTURES,
        { filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity });
      if (extensions) {
        fillTarget = extensions.pos;
      }
    }
    return fillTarget;
  }
}
