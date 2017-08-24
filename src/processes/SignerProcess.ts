import { posisInterface } from "../kernel/annotations/PosisInterface";
import { BasicProcess } from "../kernel/processes/BasicProcess";

export interface SignerMemory {
  controller: string;
  creep: string;
  message: string;
}

export class SignerProcess extends BasicProcess<SignerMemory> {
  public static imageName = "Overmind/SignerProcess";

  @posisInterface("spawn")
  private spawnController: IPosisSpawnExtension;

  public notify(msg: WombatMessage): void {
    this.sleep(0);
  }
  public run(): void {
    const controller = Game.getObjectById<StructureController>(this.memory.controller);
    if (controller === null || controller === undefined || controller.sign.text === this.memory.message) {
      this.sleep(500);
      return;
    }
    const creep = this.spawnController.getCreep(this.memory.creep);
    if (creep) {
      if (creep.signController(controller, this.memory.message) === ERR_NOT_IN_RANGE) {
        creep.travelTo(controller);
      }
    } else if (this.spawnController.getStatus(this.memory.creep).status === EPosisSpawnStatus.ERROR) {
      this.memory.creep = this.spawnController.spawnCreep({
        rooms: [controller.room.name],
        body: [[MOVE]],
        priority: 0,
        pid: this.context.id
      });
    } else {
      this.sleep(100);
    }
  }

}
