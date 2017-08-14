import { ArchitectProcess } from "./ArchitectProcess";
import { BootstrapProcess } from "./Bootstrap";
import { EmergencyWorkerProcess } from "./EmergencyWorker";
import { HiveProcess } from "./Hive";
import { OvermindMemory, OvermindProcess } from "./Overmind";
import { SpawnController } from "./SpawnController";
import { SpawnNotifier } from "./SpawnNotifier";

export const bundle: IPosisBundle<OvermindMemory> = {

  install(registry: IPosisProcessRegistry) {
    registry.register(OvermindProcess.imageName, OvermindProcess);
    registry.register(HiveProcess.imageName, HiveProcess);
    registry.register(SpawnController.imageName, SpawnController);
    registry.register(BootstrapProcess.imageName, BootstrapProcess);
    registry.register(SpawnNotifier.imageName, SpawnNotifier);
    registry.register(EmergencyWorkerProcess.imageName, EmergencyWorkerProcess);
    registry.register(ArchitectProcess.imageName, ArchitectProcess);
  },

  rootImageName: OvermindProcess.imageName,
  makeDefaultRootMemory: (override) => {
    if (override) { return override; }

    return { spawnController: undefined, hives: {} };
  }
};