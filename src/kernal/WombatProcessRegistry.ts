export interface WombatProcessRegistry extends IPosisProcessRegistry {
  getNewProcess(context: IPosisProcessContext): WombatProcess | IPosisProcess | undefined;
}
