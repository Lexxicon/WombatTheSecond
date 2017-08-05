import { assert } from "chai";
import { ProcessIDManager } from "../../../src/kernel/components/ProcessIDManager";

describe("Process Id Manager", () => {
  let idManager: ProcessIDManager;
  beforeEach(() => {
    const mem = {};
    idManager = new ProcessIDManager(() => mem);
  });

  it("can reuse id's", () => {
    const id = idManager.getId();
    idManager.returnId(id);
    const secondId = idManager.getId();

    assert.isTrue(id === secondId, `${id} is not ${secondId}`);
  });
});
