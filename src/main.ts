import { extensionRegistry } from "../lib/kernel/src";
import { processRegistry } from "../lib/kernel/src";
import { BaseKernel } from "../lib/kernel/src/lib/BaseKernel";
import { ExtensionRegistry } from "../lib/kernel/src/lib/ExtensionRegistry";
import { ProcessRegistry } from "../lib/kernel/src/lib/ProcessRegistry";
import { LoggerFactory } from "./kernal/logger/LoggerFactory";

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
  const extensionReg = new ExtensionRegistry();
  const processReg = new ProcessRegistry();
  const kernel = new BaseKernel(processReg, extensionReg);
};
