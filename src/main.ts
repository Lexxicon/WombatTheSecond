import { BaseExtensionRegistry } from "./kernal/components/BaseExtensionRegistry";
import { ProcessRegistry } from "./kernal/components/ProcessRegistry";
import { LoggerFactory } from "./kernal/logger/LoggerFactory";
import { BaseKernel } from "./kernal/WombatKernal";

const log = LoggerFactory.getLogger("main");

if (Memory.revision !== __REVISION__ || Memory.buildTime !== __BUILD_TIME__) {
  Memory.revision = __REVISION__;
  Memory.buildTime = __BUILD_TIME__;
  log.info(`loading revision: ${__REVISION__} : ${__BUILD_TIME__}`);
}

Memory.username = Memory.username || _.get(_.find(Game.spawns), "owner.username");

export const loop = () => {
  const pRegistry = new ProcessRegistry();
  const extRegistry = new BaseExtensionRegistry();
  const kernel = new BaseKernel(pRegistry, extRegistry, Memory.kernel || (Memory.kernel = {}));
};
