
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface TowerMemory {
  room: string;
  targetID: string | undefined;
}

export class TowerProcess extends BasicProcess<TowerMemory> {
  public static imageName = "Overmind/TowerProcess";

  public notify(msg: WombatMessage): void {
    this.log.info(`Received message ${JSON.stringify}`);
  }

  private findNewTargetID(): string | undefined {
    const badDudes = Game.rooms[this.memory.room].find<Creep>(FIND_HOSTILE_CREEPS);
    if (!badDudes || badDudes.length === 0) {
      return;
    }

    return badDudes[0].id;
  }

  private getTarget(): Creep | null {
    let target = Game.getObjectById<Creep>(this.memory.targetID);
    if (this.memory.targetID === undefined || !target || target.room.name !== this.memory.room) {
      this.memory.targetID = this.findNewTargetID();
      target = Game.getObjectById(this.memory.targetID);
    }
    return target;
  }

  public run(): void {
    const room = Game.rooms[this.memory.room];

    const towers = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as Tower[];
    if (towers.length === 0) {
      this.sleep(500);
    }
    const target = this.getTarget();

    if (target) {
      _.forEach(towers, (t) => t.attack(target));
    }
  }
}
