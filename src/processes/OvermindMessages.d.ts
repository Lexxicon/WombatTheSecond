
interface Messages {
  spawnMessage: SpawnMessage;
}

interface SpawnMessage extends WombatMessage {
  creep: CreepNameOrString;
}
