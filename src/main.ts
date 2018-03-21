import { BUILD_TIME, REVISION } from "./build_info";
import { LoggerFactory } from "./util/LoggerFactory";

const log = LoggerFactory.getLogger("main");

if (Memory.revision !== REVISION || Memory.buildTime !== BUILD_TIME) {
  Memory.revision = REVISION;
  Memory.buildTime = BUILD_TIME;
  log.info(`loading revision: ${REVISION} : ${BUILD_TIME}`);
}

Memory.username = Memory.username || _.get(_.find(Game.spawns), "owner.username");

export const loop = () => {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

};
