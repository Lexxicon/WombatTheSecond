import { ProcessStatus } from "kernal/ProcessStatus";

export interface WombatProcessInfo extends IPosisProcessContext {
  status: ProcessStatus;
  process?: IPosisProcess;
}
