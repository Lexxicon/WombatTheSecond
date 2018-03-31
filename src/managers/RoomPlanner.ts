import { Hive } from "./RoomManager";

global.planWalls = (arg1: string) => { new RoomPlanner().tryPlaceWalls(Game.rooms[arg1]); };

export class RoomPlanner {

  public tryPlaceRoad(hive: Hive) {
    //
  }

  public tryPlaceWalls(room: Room) {
    const bunkerCenter = (room.find(FIND_MY_SPAWNS)[0] || { pos: undefined }).pos;
    if (bunkerCenter === undefined) {
      return;
    }
    const bunkerSize = 8;
    const offset = (pos: RoomPosition, x: number, y: number) => new RoomPosition(pos.x + x, pos.y + y, pos.roomName);
    const wallSpots: RoomPosition[] = [];

    wallSpots.push(offset(bunkerCenter, 0, bunkerSize));
    wallSpots.push(offset(bunkerCenter, 0, -bunkerSize));
    wallSpots.push(offset(bunkerCenter, bunkerSize, 0));
    wallSpots.push(offset(bunkerCenter, -bunkerSize, 0));

    for (let i = 1; i <= bunkerSize; i++) {
      wallSpots.push(offset(bunkerCenter, i, bunkerSize));
      wallSpots.push(offset(bunkerCenter, -i, bunkerSize));
      wallSpots.push(offset(bunkerCenter, i, -bunkerSize));
      wallSpots.push(offset(bunkerCenter, -i, -bunkerSize));

      wallSpots.push(offset(bunkerCenter, bunkerSize, i));
      wallSpots.push(offset(bunkerCenter, bunkerSize, -i));
      wallSpots.push(offset(bunkerCenter, -bunkerSize, i));
      wallSpots.push(offset(bunkerCenter, -bunkerSize, -i));
    }

    wallSpots.forEach((pos, i) => pos.createConstructionSite(i % 3 === 0 ? STRUCTURE_RAMPART : STRUCTURE_WALL));
  }

  public tryPlaceExtension(hive: Hive) {
    const extOffset = 3;
    const spawn = hive.homeRoom.find(FIND_MY_SPAWNS)[0];
    return this.tryOffset(spawn.pos, extOffset, this.tryPlaceExtensionCross);
  }

  public tryPlaceExtensionCross(origin: RoomPosition) {
    const testPos = new RoomPosition(origin.x, origin.y, origin.roomName);
    const createExtension = this.createSite(STRUCTURE_EXTENSION);
    if (createExtension(testPos)) {
      return true;
    }
    return this.tryOffset(origin, 1, createExtension);
  }

  private createSite(typ: BuildableStructureConstant) {
    return (p: RoomPosition) => p.createConstructionSite(typ) === OK;
  }

  private tryOffset(origin: RoomPosition, offset: number, action: (p: RoomPosition) => boolean) {
    const tryPoint = new RoomPosition(origin.x, origin.y, origin.roomName);

    tryPoint.x = origin.x + offset;
    tryPoint.y = origin.y;
    if (action(tryPoint)) {
      return true;
    }
    tryPoint.x = origin.x - offset;
    tryPoint.y = origin.y;
    if (action(tryPoint)) {
      return true;
    }
    tryPoint.x = origin.x;
    tryPoint.y = origin.y + offset;
    if (action(tryPoint)) {
      return true;
    }
    tryPoint.x = origin.x;
    tryPoint.y = origin.y - offset;
    if (action(tryPoint)) {
      return true;
    }
    return false;
  }

}
