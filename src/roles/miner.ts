import { Hive } from "../managers/RoomManager";
import { Role } from "./role";

interface MinerMemory {
  state: State;
  pickupTarget?: string;
}
enum State {
  HARVEST,
  FILL,
  BUILD,
  UPGRADE,
  REPAIR
}
export class Miner implements Role<MinerMemory> {

  public id = "MINER";

  public create(spawn: StructureSpawn): string | undefined {
    let size = spawn.room.energyAvailable / (BODYPART_COST[WORK] + BODYPART_COST[MOVE] + BODYPART_COST[CARRY]);
    const body: BodyPartConstant[] = [];
    while (size > 0) {
      size--;
      body.push(WORK, CARRY, MOVE);
    }
    const rslt = spawn.createCreep(body, undefined, { role: this.id });
    if (_.isString(rslt)) {
      return rslt;
    }
    return undefined;
  }

  public initMemory() {
    return { state: State.HARVEST };
  }

  public run(creep: Creep, mem: MinerMemory, hiveMem: Hive): void {
    if (mem.state === undefined) { mem.state = State.HARVEST; }
    const state = mem.state;
    this.actions[mem.state](creep, mem, hiveMem);
    if (mem.state !== state) {
      creep.say(this.icons[mem.state]);
    }
  }

  private icons = {
    [State.HARVEST]: "🔄",
    [State.FILL]: "⇄",
    [State.BUILD]: "🔨",
    [State.UPGRADE]: "🙏",
    [State.REPAIR]: "🔧"
  };

  private actions = {
    [State.HARVEST]: this.harvest,
    [State.FILL]: this.fill,
    [State.BUILD]: this.build,
    [State.UPGRADE]: this.upgrade,
    [State.REPAIR]: this.repair
  };

  protected repair(creep: Creep, mem: MinerMemory, hive: Hive) {
    if (creep.carry.energy === 0) {
      mem.state = State.HARVEST;
      return;
    }
    if (hive.needsRepair.length === 0) {
      mem.state = State.BUILD;
      return;
    }
    if (creep.repair(hive.needsRepair[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(hive.needsRepair[0]);
    }
  }

  protected fill(creep: Creep, mem: MinerMemory, hive: Hive) {
    const spawns = creep.pos.findClosestByRange(FIND_MY_SPAWNS, { filter: (s) => s.energy < s.energyCapacity });
    let fillTarget;
    if (spawns) {
      fillTarget = spawns;
    } else {
      const extensions = creep.room.find(FIND_MY_STRUCTURES,
        { filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity });
      if (extensions.length > 0) {
        fillTarget = extensions[0];
      }
    }

    if (fillTarget && creep.carry.energy > 0) {
      if (creep.transfer(fillTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(fillTarget, { range: 1 });
      }
    } else {
      if (creep.carryCapacity > 0) {
        mem.state = State.BUILD;
      } else {
        mem.state = State.HARVEST;
      }
    }
  }

  protected build(creep: Creep, mem: MinerMemory, hive: Hive) {
    const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length > 0 && creep.carry.energy > 0) {
      if (creep.build(sites[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sites[0]);
      }
    } else {
      if (creep.carry.energy === 0) {
        mem.state = State.HARVEST;
      } else {
        mem.state = State.UPGRADE;
      }
    }
  }

  protected upgrade(creep: Creep, mem: MinerMemory, hive: Hive) {
    if (creep.room.controller) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { range: 1 });
      }
    }

    if (creep.carry.energy === 0) {
      const upgradeBox = hive.upgradeSpot.lookFor(LOOK_STRUCTURES) as StructureContainer[];
      if (upgradeBox.length > 0 && upgradeBox[0].store.energy > 0) {
        if (creep.withdraw(upgradeBox[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(upgradeBox[0]);
          return;
        }
      }
      mem.state = State.HARVEST;
    }
  }

  protected harvest(creep: Creep, mem: MinerMemory, hive: Hive) {
    if (creep.ticksToLive && creep.ticksToLive < 100) {
      creep.suicide();
      return;
    }

    const found = hive.harvestSpots
      .map((f) => f.lookFor(LOOK_STRUCTURES)[0] || {})
      .filter((f) => f.structureType === STRUCTURE_CONTAINER) as Array<StructureContainer | StructureStorage>;
    if (hive.homeRoom.storage !== undefined) {
      found.push(hive.homeRoom.storage);
    }
    let pickup = Game.getObjectById(mem.pickupTarget) as StructureContainer | StructureStorage;
    if ((pickup === undefined || pickup === null) && found.length > 0) {
      pickup = found.reduce((a, b) => a.store.energy > b.store.energy ? a : b);
    }
    if (pickup !== undefined && pickup.store.energy > 50) {
      mem.pickupTarget = pickup.id;
      if (creep.withdraw(pickup, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(pickup);
      }
    } else {
      const source = creep.pos.findClosestByPath(FIND_SOURCES);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { range: 1 });
      }
    }

    if (creep.carry.energy === creep.carryCapacity) {
      mem.pickupTarget = undefined;
      if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
        mem.state = State.FILL;
      } else if (hive.needsRepair.length > 0) {
        mem.state = State.REPAIR;
      } else if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        mem.state = State.BUILD;
      } else {
        mem.state = State.UPGRADE;
      }
    }
  }
}
