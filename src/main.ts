import { BUILD_TIME, REVISION } from "./build_info";
import { Miner } from "./roles/miner";
import { LoggerFactory } from "./util/LoggerFactory";

const log = LoggerFactory.getLogger("main");

if (Memory.revision !== REVISION || Memory.buildTime !== BUILD_TIME) {
  Memory.revision = REVISION;
  Memory.buildTime = BUILD_TIME;
  log.info(`loading revision: ${REVISION} : ${BUILD_TIME}`);
}
const miner = new Miner();

const roles = {
  [miner.id]: miner
};

Memory.username = Memory.username || _.get(_.find(Game.spawns), "owner.username");

declare const global: any;

global.myCommand = (arg1: string) => { console.log(arg1); };

export const loop = () => {
  const creepCount = {
    [miner.id]: 0
  };

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    } else if (Memory.creeps[name].role) {
      creepCount[Memory.creeps[name].role]++;
    }
  }

  if (creepCount[miner.id] < 4) {
    const spawn = "Spawn1";
    miner.create(Game.spawns[spawn], { sourceID: "59830045b097071b4adc4023", harvestSpot: { x: 40, y: 17 } });
  }

  for (const id in Game.creeps) {
    const creep = Game.creeps[id];
    if (roles[creep.memory.role]) {
      roles[creep.memory.role].run(creep);
    }
  }
};
