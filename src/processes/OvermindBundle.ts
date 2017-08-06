import { HiveProcess } from "./Hive";
import { OvermindMemory, OvermindProcess } from "./Overmind";

export const bundle: IPosisBundle<OvermindMemory> = {

  install(registry: IPosisProcessRegistry) {
    registry.register(OvermindProcess.imageName, OvermindProcess);
    registry.register(HiveProcess.imageName, HiveProcess);
  },

  rootImageName: OvermindProcess.imageName,
  makeDefaultRootMemory: (override) => {
    if (override) { return override; }

    return { hives: {} };
  }
};
