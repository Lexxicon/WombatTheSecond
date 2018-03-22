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

export class Miner implements Role<any> {

  public id = "MINER";

  public create(spawn: StructureSpawn, initMem: any): void {
    spawn.createCreep([WORK, MOVE, CARRY], undefined, _.merge(initMem, { state: State.HARVEST, role: this.id }));
  }

  public run(creep: Creep): void {
    const mem = creep.memory as any as MinerMemory;
    this.actions[mem.state](creep, mem);
  }

  private actions = {
    [State.HARVEST]: this.harvest,
    [State.FILL]: this.fill,
    [State.BUILD]: this.build,
    [State.UPGRADE]: this.upgrade

  };

  protected fill(creep: Creep, mem: MinerMemory) {
    const spawns = creep.room.find(FIND_MY_SPAWNS, (s) => s.energy < s.energyCapacity);
    let fillTarget;
    if (spawns.length > 0) {
      fillTarget = spawns[0];
    } else {
      const extensions = creep.room.find(FIND_MY_STRUCTURES,
        (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity);
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
    if (sites.length > 0) {
      if (creep.build(sites[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sites[0]);
      }
    }
    if (creep.carry.energy === 0) {
      mem.state = State.HARVEST;
    } else {
      mem.state = State.FILL;
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
      } else {
        mem.state = State.UPGRADE;
      }
    }
  }
}
