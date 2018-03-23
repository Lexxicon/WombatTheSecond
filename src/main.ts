import { BUILD_TIME, REVISION } from "./build_info";
import { RoomManager } from "./managers/RoomManager";
import { Miner } from "./roles/miner";
import { Role } from "./roles/role";
import { LoggerFactory } from "./util/LoggerFactory";

const log = LoggerFactory.getLogger("main");

if (Memory.revision !== REVISION || Memory.buildTime !== BUILD_TIME) {
  Memory.revision = REVISION;
  Memory.buildTime = BUILD_TIME;
  Memory.username = Memory.username || _.get(_.find(Game.spawns), "owner.username");
  log.info(`loading revision: ${REVISION} : ${BUILD_TIME}`);
} else {
  log.debug("Reset");
}

const miner = new Miner();

const roles = {
  [miner.id]: miner
};

const roomManager = new RoomManager(roles);

export const loop = () => {
  _.forEach(Game.rooms, (r) => roomManager.process(r));
};
