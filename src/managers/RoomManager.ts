import { Role } from "../roles/role";

interface ManagerMemory {
  [roomName: string]: Hive;
}

interface Hive {
  creeps: {
    [name: string]: {};
  };
}

interface RolesRepo {
  [roleId: string]: Role<any>;
}

interface RoleCount {
  [role: string]: number | undefined;
}

const desiredRoles = {
  MINER: 4
} as RoleCount;

export class RoomManager {
  private roomMem: ManagerMemory;
  private roles: RolesRepo;

  constructor(roles: RolesRepo) {
    this.roomMem = Memory.roomManager || (Memory.roomManager = {});
    this.roles = roles;
  }

  public process(room: Room) {
    const hive = Memory.roomManager[room.name] || (Memory.roomManager[room.name] = { creeps: {} });
    const roleCount = this.processCreeps(hive);
    this.spawnCreeps(room, roleCount, hive);
  }

  public processCreeps(hive: Hive): RoleCount {
    const roleCount: RoleCount = {};
    for (const creep in hive.creeps) {
      if (creep in Game.creeps) {
        const role = Game.creeps[creep].memory.role;
        this.roles[role].run(Game.creeps[creep], hive.creeps[creep]);
        roleCount[role] = (roleCount[role] || 0) + 1;
      } else {
        delete hive.creeps[creep];
        delete Memory.creeps[creep];
      }
    }

    return roleCount;
  }

  public spawnCreeps(room: Room, roleCount: RoleCount, hive: Hive) {
    for (const role in desiredRoles) {
      const dCount = desiredRoles[role] || 0;
      const rCount = roleCount[role] || 0;

      if (dCount > rCount) {
        const spawn = this.findSpawn(room);
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
