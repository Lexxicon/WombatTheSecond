import { Hive } from "./RoomManager";

export class RoomPlanner {

  public tryPlaceRoad(hive: Hive) {
    //
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
