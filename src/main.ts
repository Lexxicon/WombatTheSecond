import { BUILD_TIME, REVISION } from "./build_info";
import { BaseExtensionRegistry } from "./kernal/components/BaseExtensionRegistry";
import { ProcessRegistry } from "./kernal/components/ProcessRegistry";
import { LoggerFactory } from "./kernal/logger/LoggerFactory";
import { BaseKernel } from "./kernal/WombatKernal";

const log = LoggerFactory.getLogger("main");

if (Memory.revision !== REVISION || Memory.buildTime !== BUILD_TIME) {
  Memory.revision = REVISION;
  Memory.buildTime = BUILD_TIME;
  log.info(`loading revision: ${REVISION} : ${BUILD_TIME}`);
}

Memory.username = Memory.username || _.get(_.find(Game.spawns), "owner.username");

export const loop = () => {
  const pRegistry = new ProcessRegistry();
  const extRegistry = new BaseExtensionRegistry();
  const kernel = new BaseKernel(pRegistry, extRegistry, Memory.kernel || (Memory.kernel = {}));
};
