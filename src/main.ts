import { LoggerFactory } from "kernal/logger/LoggerFactory";
import { BaseExtensionRegistry } from "./kernal/components/BaseExtensionRegistry";
import { ProcessRegistry } from "./kernal/components/ProcessRegistry";
import { WombatKernal } from "./kernal/WombatKernal";

const log = LoggerFactory.getLogger("main");

if (Memory.revision !== __REVISION__ || Memory.buildTime !== __BUILD_TIME__) {
  Memory.revision = __REVISION__;
  Memory.buildTime = __BUILD_TIME__;
  log.info(`loading revision: ${__REVISION__} : ${__BUILD_TIME__}`);
}

Memory.username = Memory.username ||
  _.chain(Game.rooms)
    .map("controller")
    .flatten()
    .filter("my")
    .map("owner.username")
    .first();

export const loop = () => {
  const pRegistry = new ProcessRegistry();
  const extRegistry = new BaseExtensionRegistry();
  const kernel = new WombatKernal(pRegistry, extRegistry, Memory.kernel || (Memory.kernel = {}));
};
