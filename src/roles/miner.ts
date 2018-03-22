import { Role } from "./role";

interface InitMemory {
  harvestSpot: { x: number, y: number };
  sourceID: string;
}

interface MinerMemory {
  harvestSpot: { x: number, y: number };
  sourceID: string;
  state: State;
}

enum State {
  TRANSIT,
  HARVEST
}

export class Miner implements Role<InitMemory> {

  public id = "MINER";

  public create(spawn: StructureSpawn, initMem: InitMemory): void {
    spawn.createCreep([WORK, MOVE], undefined, _.merge(initMem, { state: State.TRANSIT, role: this.id }));
  }

  public run(creep: Creep): void {
    const mem = creep.memory as any as MinerMemory;
    this.actions[mem.state](creep, mem);
  }

  private actions = {
    [State.HARVEST]: this.harvest,
    [State.TRANSIT]: this.transit
  };

  protected transit(creep: Creep, mem: MinerMemory) {
    if (creep.moveTo(mem.harvestSpot.x, mem.harvestSpot.y) !== OK) {
      //
    } else if (creep.pos.isEqualTo(mem.harvestSpot.x, mem.harvestSpot.y)) {
      mem.state = State.HARVEST;
    }
  }

  protected harvest(creep: Creep, mem: MinerMemory) {
    const src = new Source(mem.sourceID);
    creep.harvest(src);
  }
}
