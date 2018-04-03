
interface Creep {
  moveToRoom(room: string): ScreepsReturnCode;
}

Creep.prototype.moveToRoom = function(room: string) {
  if (this.pos.roomName === room) {
    if (this.pos.x === 0) {
      return this.move(RIGHT);
    }
    if (this.pos.x === 50) {
      return this.move(LEFT);
    }
    if (this.pos.y === 0) {
      return this.move(BOTTOM);
    }
    if (this.pos.y === 50) {
      return this.move(TOP);
    }
    return ERR_INVALID_TARGET;
  }
  return this.moveTo(_.create(RoomPosition.prototype, { x: 25, y: 25, roomName: room }));
};
