export class ProcessIDManager {
  private mem: () => {};
  private memory: {
    idPool: PosisPID[],
    lastID: number
  };

  constructor(mem: () => any) {
    this.memory = {
      get idPool(): PosisPID[] { return mem().idPool; },
      set idPool(pool: PosisPID[]) { mem().idPool = pool; },
      get lastID(): number { return mem().lastID; },
      set lastID(id: number) { mem().lastID = id; },
    };
    this.mem = mem;
    _.defaults(this.mem(), { idPool: [], lastID: 1 });
  }

  public getId(): PosisPID {
    return this.memory.idPool.pop() || (_.padLeft("" + this.memory.lastID++, 5));
  }

  public returnId(id: PosisPID): void {
    this.memory.idPool.push(id);
  }
}
