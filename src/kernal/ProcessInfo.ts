import { ProcessStatus } from "kernal/ProcessStatus";

export interface ProcessInfo {
  id: PosisPID;
  parent_id: PosisPID;
  name: string;
  status: ProcessStatus;
  process?: IPosisProcess;
}
