import { Role } from "../roles/role";

interface ManagerMemory {
  [roomName: string]: Hive;
}

interface Hive {
  creeps: string[];
}

interface Roles {
  [roleId: string]: Role<any>;
}

const desiredRoles = {
  MINER: 4
};

export class RoomManager {
  private roomMem: ManagerMemory;
  private roles: Roles;

  constructor(roles: Roles) {
    this.roomMem = Memory.roomManager || (Memory.roomManager = {});
    this.roles = roles;
  }

  public process(room: Room) {
    const hive = this.roomMem[room.name] || (this.roomMem[room.name] = { creeps: [] });
    const roleCount: { [roleId: string]: number } = {};
    for (const creep in hive.creeps) {
      if (Game.creeps[creep]) {
        this.roles[Game.creeps[creep].memory.role].run(Game.creeps[creep]);
        if (!roleCount[Game.creeps[creep].memory.role]) {
          roleCount[Game.creeps[creep].memory.role] = 0;
        }
        roleCount[Game.creeps[creep].memory.role]++;
      } else {
        delete hive.creeps[creep];
      }
    }
  }
}
