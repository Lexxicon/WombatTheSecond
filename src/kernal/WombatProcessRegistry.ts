export interface WombatProcessRegistry extends IPosisProcessRegistry {
  getNewProcess(imageName: string, context: IPosisProcessContext): IPosisProcess | undefined;
}
