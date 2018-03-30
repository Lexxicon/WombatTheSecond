import { Role } from "../roles/role";
import { RoomPlanner } from "./RoomPlanner";

interface ManagerMemory {
  [roomName: string]: Hive;
}

enum HiveState {
  SETUP,
  GROWTH
}

const planner = new RoomPlanner();

export interface Hive {
  state: HiveState;
  homeRoomName: string;
  homeRoom: Room;
  established: boolean;
  creeps: {
    [name: string]: {};
  };
  roleBoard: {
    [role: string]: any;
  };
  roleCount: RoleCount;
  needsRepair: Structure[];
  needsRepairId: string[];
  upgradeSpot: RoomPosition;
  upgradeSpotSerialized: { x: number, y: number, roomName: string };
  harvestSpots: RoomPosition[];
  harvestSpotsSerialized: Array<{ x: number, y: number, roomName: string }>;
}

interface RolesRepo {
  [roleId: string]: Role<any>;
}

interface RoleCount {
  [role: string]: number | undefined;
}

const desiredRoles = {
  [HiveState.GROWTH]: {
    MINER: 5,
    EXTRACTOR: 2,
    HAUlER: 4
  } as RoleCount,
  [HiveState.SETUP]: {
    MINER: 5
  } as RoleCount,
};

export class RoomManager {
  private roomMem: ManagerMemory;
  private roles: RolesRepo;

  constructor(roles: RolesRepo) {
    this.roomMem = Memory.roomManager || (Memory.roomManager = {});
    this.roles = roles;
  }

  public prep() {
    this.roomMem = Memory.roomManager || (Memory.roomManager = {});
    for (const hiveID in this.roomMem) {
      const hive = this.roomMem[hiveID];
      if (hive.upgradeSpotSerialized !== undefined) {
        hive.upgradeSpot = new RoomPosition(
          hive.upgradeSpotSerialized.x,
          hive.upgradeSpotSerialized.y,
          hive.upgradeSpotSerialized.roomName);
      }

      hive.needsRepair = [];
      if (hive.needsRepairId !== undefined) {
        hive.needsRepairId = hive.needsRepairId.filter((f) => {
          const struct = Game.getObjectById(f) as Structure;
          if (struct !== null && struct.hits < struct.hitsMax) {
            hive.needsRepair.push(struct);
            return true;
          }
          return false;
        });
      }
      hive.harvestSpots = [];
      hive.homeRoom = Game.rooms[hive.homeRoomName];
      for (const id in hive.harvestSpotsSerialized) {
        const args = hive.harvestSpotsSerialized[id];
        hive.harvestSpots.push(new RoomPosition(args.x, args.y, args.roomName));
      }
    }
  }

  private getHiveMem(room: Room) {
    this.roomMem[room.name] = _.defaults(this.roomMem[room.name] || {}, {
      state: HiveState.SETUP,
      homeRoomName: room.name,
      established: false,
      creeps: {},
      roleBoard: {},
      harvestSpotsSerialized: [],
      needsRepairId: []
    });
    return this.roomMem[room.name];
  }

  public process(room: Room) {
    const hive = this.getHiveMem(room);
    if (!hive.established) {
      this.establishHive(hive);
    }
    this.findRepairJobs(hive);
    this.updateConstructionJobs(hive);
    this.processCreeps(hive);
    this.spawnCreeps(hive);
  }

  public findRepairJobs(hive: Hive) {
    for (const struct of hive.homeRoom.find(FIND_MY_STRUCTURES).filter((f) => f.structureType !== STRUCTURE_RAMPART)) {
      if (struct.hits < (struct.hitsMax * 0.9) && hive.needsRepairId.indexOf(struct.id) < 0) {
        hive.needsRepairId.push(struct.id);
      }
    }
  }

  public updateConstructionJobs(hive: Hive) {
    if (hive.homeRoom.find(FIND_CONSTRUCTION_SITES).length > 0) {
      return;
    }

    for (const spot of hive.harvestSpots) {
      if (spot.lookFor(LOOK_STRUCTURES).length === 0) {
        spot.createConstructionSite(STRUCTURE_CONTAINER);
        return;
      }
    }

    if (hive.state === HiveState.SETUP) {
      hive.state = HiveState.GROWTH;
    }
    const extensions = hive.homeRoom.find(FIND_STRUCTURES, { filter: (f) => f.structureType === STRUCTURE_EXTENSION });
    const extOffset = 3;
    if (extensions.length < CONTROLLER_STRUCTURES.extension[hive.homeRoom.controller!.level]) {
      if (planner.tryPlaceExtension(hive)) {
        return;
      }
    }

    if (hive.upgradeSpot.lookFor(LOOK_STRUCTURES).length === 0) {
      hive.upgradeSpot.createConstructionSite(STRUCTURE_CONTAINER);
      return;
    }
  }

  public establishHive(hive: Hive) {
    const homeSources = hive.homeRoom.find(FIND_SOURCES);
    const centerPoint = (hive.homeRoom.find(FIND_MY_SPAWNS)[0] || { pos: hive.homeRoom.getPositionAt(25, 25) }).pos;

    for (const source of homeSources) {
      const path = source.pos.findPathTo(centerPoint, { ignoreCreeps: true, ignoreRoads: true })[0];
      const args = { x: path.x, y: path.y, roomName: hive.homeRoomName };
      hive.harvestSpotsSerialized.push(args);
      hive.harvestSpots.push(new RoomPosition(args.x, args.y, args.roomName));
    }

    const upgradeSpot = hive.homeRoom.controller!.pos.findPathTo(
      centerPoint,
      { ignoreCreeps: true, ignoreRoads: true }
    )[0];

    const upgradeArgs = { x: upgradeSpot.x, y: upgradeSpot.y, roomName: hive.homeRoomName };
    hive.upgradeSpotSerialized = upgradeArgs;
    hive.upgradeSpot = new RoomPosition(upgradeArgs.x, upgradeArgs.y, upgradeArgs.roomName);

    hive.established = true;
  }

  public processCreeps(hive: Hive) {
    const roleCount: RoleCount = {};
    for (const creep in hive.creeps) {
      if (creep in Game.creeps) {
        const role = Game.creeps[creep].memory.role;
        roleCount[role] = (roleCount[role] || 0) + 1;
        if (Game.creeps[creep].spawning) { continue; }
        this.roles[role].run(Game.creeps[creep], hive.creeps[creep], hive);
      } else {
        delete hive.creeps[creep];
        delete Memory.creeps[creep];
      }
    }
    hive.roleCount = roleCount;
  }

  public spawnCreeps(hive: Hive) {
    if (hive.homeRoom.energyAvailable < hive.homeRoom.energyCapacityAvailable * 0.7 &&
      (hive.roleCount.MINER || 0) > 1) {
      return;
    }
    for (const role in desiredRoles[hive.state]) {
      const dCount = desiredRoles[hive.state][role] || 0;
      const rCount = hive.roleCount[role] || 0;

      if (dCount > rCount) {
        const spawn = this.findSpawn(hive.homeRoom);
        if (spawn) {
          const rslt = this.roles[role].create(spawn);
          if (rslt) {
            hive.creeps[rslt] = this.roles[role].initMemory();
          }
        } else {
          return;
        }
      }
    }
  }

  private findSpawn(room: Room): StructureSpawn | undefined {
    const spawns = room.find(FIND_MY_SPAWNS, { filter: (s) => s.spawning === null });
    const spawn = spawns[0] || undefined;
    return spawn;
  }
}
