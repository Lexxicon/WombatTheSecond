
interface RoomIntel {
  lastSeen: number;
  roomName: string;
}

interface ScoutMem {
  name: string;
  targetRoom: string;
}

interface EmpireIntel {
  rooms: { [name: string]: RoomIntel };
  scouts: ScoutMem[];
  scoutRequests: string[];
}

export class Intelligence {

  private mem: EmpireIntel;

  constructor() {
    this.mem = Memory.empire.intel;
  }

  public run(): void {
    for (const name in Game.rooms) {
      if (this.mem.rooms[name] === undefined) {
        this.mem.rooms[name] = { lastSeen: Game.time, roomName: name };
      }
    }
    for (const name in this.mem.rooms) {
      const intel = this.mem.rooms[name];
      if (Game.rooms[name] !== undefined) {
        intel.lastSeen = Game.time;
        const i = this.mem.scoutRequests.indexOf(name);
        if (i >= 0) {
          this.mem.scoutRequests.splice(i, 1);
        }
      }
      if (Game.time - intel.lastSeen > 500 && this.mem.scoutRequests.indexOf(name) < 0) {
        this.mem.scoutRequests.push(name);
      }
    }

    for (const scout of this.mem.scouts) {
      const creep = Game.creeps[scout.name];
      if (creep === undefined) {
        this.mem.scouts.splice(this.mem.scouts.indexOf(scout), 1);
        continue;
      }
    }
  }
}
