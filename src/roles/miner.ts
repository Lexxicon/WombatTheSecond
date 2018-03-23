import { Role } from "./role";

interface MinerMemory {
  state: State;
}
enum State {
  HARVEST,
  FILL,
  BUILD,
  UPGRADE
}

export class Miner implements Role<MinerMemory> {

  public id = "MINER";

  public create(spawn: StructureSpawn): string | undefined {
    const rslt = spawn.createCreep([WORK, MOVE, CARRY], undefined, { role: this.id });
    if (_.isString(rslt)) {
      return rslt;
    }
    return undefined;
  }

  public initMemory() {
    return { state: State.HARVEST };
  }

  public run(creep: Creep, mem: MinerMemory): void {
    if (mem.state === undefined) { mem.state = State.HARVEST; }
    const state = mem.state;
    this.actions[mem.state](creep, mem);
    if (mem.state !== state) {
      creep.say(this.icons[mem.state]);
    }
  }

  private icons = {
    [State.HARVEST]: "🔄",
    [State.FILL]: "⇄",
    [State.BUILD]: "🔨",
    [State.UPGRADE]: "🙏"
  };

  private actions = {
    [State.HARVEST]: this.harvest,
    [State.FILL]: this.fill,
    [State.BUILD]: this.build,
    [State.UPGRADE]: this.upgrade

  };

  protected fill(creep: Creep, mem: MinerMemory) {
    const spawns = creep.room.find(FIND_MY_SPAWNS, { filter: (s) => s.energy < s.energyCapacity });
    let fillTarget;
    if (spawns.length > 0) {
      fillTarget = spawns[0];
    } else {
      const extensions = creep.room.find(FIND_MY_STRUCTURES,
        { filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity });
      if (extensions.length > 0) {
        fillTarget = extensions[0];
      }
    }

    if (fillTarget && creep.carry.energy > 0) {
      if (creep.transfer(fillTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(fillTarget);
      }
    } else {
      if (creep.carryCapacity > 0) {
        mem.state = State.UPGRADE;
      } else {
        mem.state = State.HARVEST;
      }
    }
  }

  protected build(creep: Creep, mem: MinerMemory) {
    const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length > 0 && creep.carry.energy > 0) {
      if (creep.build(sites[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sites[0]);
      }
    } else {
      if (creep.carry.energy === 0) {
        mem.state = State.HARVEST;
      } else {
        mem.state = State.FILL;
      }
    }
  }

  protected upgrade(creep: Creep, mem: MinerMemory) {
    if (creep.room.controller) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }

    if (creep.carry.energy === 0) {
      mem.state = State.HARVEST;
    }
  }

  protected harvest(creep: Creep, mem: MinerMemory) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }

    if (creep.carry.energy === creep.carryCapacity) {
      if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
        mem.state = State.FILL;
      } else if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        mem.state = State.BUILD;
      } else {
        mem.state = State.UPGRADE;
      }
    }
  }
}
