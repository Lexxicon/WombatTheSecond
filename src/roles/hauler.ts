import { Role } from "./role";

interface HaulerMemory {
  target: { x: number, y: number };
}

enum State {
  PICKUP,
  DROP_OFF
}

export class Hauler implements Role<any> {
  public id = "HAULER";

  public create(spawn: StructureSpawn, mem: {}): void {
    spawn.createCreep([CARRY, MOVE], undefined, _.merge(mem, { state: State.PICKUP, role: this.id }));

  }
  public run(creep: Creep): void {

  }

  protected pickup(creep: Creep): void {

  }

  protected dropOff(creep: Creep, mem: HaulerMemory): void {
    if (creep.carry[RESOURCE_ENERGY] > 0) {
      const target = creep.room.find(FIND_MY_SPAWNS)[0];
      if (!target) {
        // log.warning("failed to find drop off spawn");
        return;
      }
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
    }
  }
}
