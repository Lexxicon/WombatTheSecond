import { BUILD_TIME, REVISION } from "./build_info";
import { RoomManager } from "./managers/RoomManager";
import { Tower } from "./managers/Tower";
import "./prototypes/Creep";
import "./prototypes/RoomObject";
import { Extractor } from "./roles/extractor";
import { Hauler } from "./roles/hauler";
import { Miner } from "./roles/miner";
import { Role } from "./roles/role";
import { LoggerFactory } from "./util/LoggerFactory";
import { wrapLoop as MemCache } from "./util/MemCache";

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
const extractor = new Extractor();
const hauler = new Hauler();

const roles = {
  [miner.id]: miner,
  [extractor.id]: extractor,
  [hauler.id]: hauler
};

const roomManager = new RoomManager(roles);
const turretManager = new Tower();
export const loop = () => {

  roomManager.prep();
  _.forEach(Game.rooms, (r) => roomManager.process(r));
  try {
    turretManager.run();
  } catch (e) {
    log.error("" + e);
  }
};
