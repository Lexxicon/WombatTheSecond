export class ProcessIDManager {
  private memory: () => {
    idPool: PosisPID[];
    lastID: number;
  };

  constructor(mem: any) {
    this.memory = mem;
    _.defaults(this.memory(), { idPool: [], lastID: 1 });
  }

  public getId(): PosisPID {
    return this.memory().idPool.pop() || (_.padLeft("" + this.memory().lastID++, 5));
  }

  public returnId(id: PosisPID): void {
    this.memory().idPool.push(id);
  }
}
