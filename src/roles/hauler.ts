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

export class Hauler implements Role<HaulerMemory> {
  public id = "HAUlER";

  public create(spawn: StructureSpawn): string | undefined {
    const rslt = spawn.createCreep([MOVE, CARRY, CARRY, MOVE, CARRY, CARRY], undefined, { role: this.id });
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
    const struct = pos.lookFor(LOOK_STRUCTURES)[0];

    if (memory.state === State.PICKUP) {
      if (creep.withdraw(struct, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(pos);
      } else {
        if (creep.carry.energy === creep.carryCapacity) {
          memory.state = State.DROPOFF;
        }
        memory.destination = this.findDestination(creep, memory, hive);
      }
    }

    if (memory.state === State.DROPOFF) {
      if (creep.transfer(struct, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(pos);
      } else {
        if (creep.carry.energy === 0) {
          memory.state = State.PICKUP;
        }
        memory.destination = this.findDestination(creep, memory, hive);
      }
    }
  }

  private findDestination(creep: Creep, memory: HaulerMemory, hive: Hive): { x: number, y: number, roomName: string } {
    if (memory.state === State.PICKUP) {
      const found = hive.harvestSpots
        .map((f) => f.lookFor(LOOK_STRUCTURES)[0])
        .filter((f) => f.structureType === STRUCTURE_CONTAINER) as StructureContainer[];

      return found.reduce((a, b) => a.store.energy > b.store.energy ? a : b).pos;
    }

    if (memory.state === State.DROPOFF) {
      if (hive.homeRoom.energyAvailable < hive.homeRoom.energyCapacityAvailable) {
        return this.findSpawnRefill(hive.homeRoom);
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

  private findSpawnRefill(room: Room) {
    const spawns = room.find(FIND_MY_SPAWNS, { filter: (s) => s.energy < s.energyCapacity });
    let fillTarget = { x: 0, y: 0, roomName: "" };
    if (spawns.length > 0) {
      fillTarget = spawns[0].pos;
    } else {
      const extensions = room.find(FIND_MY_STRUCTURES,
        { filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity });
      if (extensions.length > 0) {
        fillTarget = extensions[0].pos;
      }
    }
    return fillTarget;
  }
}
