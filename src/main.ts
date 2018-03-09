import { BUILD_TIME, REVISION } from "./build_info";
import { BaseExtensionRegistry } from "./kernel/components/BaseExtensionRegistry";
import { ProcessIDManager } from "./kernel/components/ProcessIDManager";
import { ProcessRegistry } from "./kernel/components/ProcessRegistry";
import { LoggerFactory } from "./kernel/logger/LoggerFactory";
import { bundle as testBundle } from "./kernel/processes/PosisTest";
import { BaseKernel } from "./kernel/WombatKernel";
import { bundle as overmindBundle } from "./processes/OvermindBundle";

const log = LoggerFactory.getLogger("main");
const kernelMemory = () => (Memory.kernel || (Memory.kernel = {}));

const pRegistry = new ProcessRegistry();
const extRegistry = new BaseExtensionRegistry();
const idManager = new ProcessIDManager(() => (Memory.pids || (Memory.pids = {})));
const kernel = new BaseKernel(pRegistry, extRegistry, idManager, kernelMemory);

extRegistry.register("wombatKernel", kernel);
extRegistry.register("baseKernel", kernel);
extRegistry.register("sleep", kernel);
extRegistry.register("wombatSleepExtension", kernel);

testBundle.install(pRegistry);

if (Memory.revision !== REVISION || Memory.buildTime !== BUILD_TIME) {
  Memory.revision = REVISION;
  Memory.buildTime = BUILD_TIME;
  log.info(`loading revision: ${REVISION} : ${BUILD_TIME}`);
  // start the testing process to make sure we didn't bork something
  kernel.startProcess(testBundle.rootImageName || "", { maxRunTime: 1 });
}

kernel.setRootBundle(overmindBundle);
overmindBundle.install(pRegistry);

Memory.username = Memory.username || _.get(_.find(Game.spawns), "owner.username");

export const loop = () => {
  kernel.run();
};
