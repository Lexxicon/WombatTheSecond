export class ProcessIDManager {
  private memory: {
    idPool: number[];
    lastID: number;
  };

  constructor(mem: any) {
    this.memory = mem;
    _.defaults(this.memory, { idPool: [], lastID: 0 });
  }

  public getId(): number {
    return this.memory.idPool.pop() || this.memory.lastID++;
  }

  public returnId(id: number): void {
    this.memory.idPool.push(id);
  }
}
