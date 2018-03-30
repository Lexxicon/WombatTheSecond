
const DAMAGED_BUILDINGS = {
  filter: (f: AnyStructure) => f.structureType !== STRUCTURE_RAMPART && f.hits < f.hitsMax
};
const DAMAGED_ROADS = {
  filter: (f: AnyStructure) => f.structureType === STRUCTURE_ROAD && f.hits < f.hitsMax
};
const DAMAGED_WALLS = {
  filter: (f: AnyStructure) => {
    return (f.structureType === STRUCTURE_WALL || f.structureType === STRUCTURE_RAMPART) && f.hits < f.hitsMax;
  }
};
const score = {
  [TOUGH]: -1,
  [MOVE]: 0,
  [CARRY]: 0,
  [WORK]: 1,
  [ATTACK]: 10,
  [RANGED_ATTACK]: 10,
  [HEAL]: 100,
  [CLAIM]: 1000,
};
export class Tower {
  private targetCache: { [room: string]: string } = {};

  public run() {
    _.filter(Game.structures, (struct) => struct.structureType === STRUCTURE_TOWER)
      .forEach((tower) => { this.handleTower(tower as StructureTower); });
  }

  private handleTower(t: StructureTower) {
    const hostiles = t.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      const targetId = this.targetCache[t.room.name];
      let target = hostiles.filter((f) => f.id === targetId)[0];

      if (targetId === undefined || target === undefined) {
        target = this.lookForTarget(hostiles);
        this.targetCache[t.room.name] = target.id;
      }

      t.attack(target);

      return;
    }

    if (t.energy > t.energyCapacity * 0.7) {
      let repTargets: AnyStructure[] = t.room.find(FIND_MY_STRUCTURES, DAMAGED_BUILDINGS);
      if (repTargets.length === 0) {
        repTargets = t.room.find(FIND_STRUCTURES, DAMAGED_ROADS);
      }
      if (repTargets.length === 0) {
        repTargets = t.room.find(FIND_STRUCTURES, DAMAGED_ROADS);
      }
      if (repTargets.length === 0) {
        return;
      }
      const target = repTargets.reduce((a, b) => a.hits < b.hits ? a : b);
      t.repair(target);
    }

  }

  private lookForTarget(creeps: Creep[]) {
    const target = creeps.map((c) => ({ c, score: this.scoreBody(c.body) }))
      .reduce((a, b) => a.score > b.score ? a : b);
    return target.c;
  }

  private scoreBody(parts: BodyPartDefinition[]) {
    return _.sum(parts.map((p) => score[p.type]));
  }
}
