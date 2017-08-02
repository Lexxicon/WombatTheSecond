
if (Memory.version !== (__REVISION__ + __BUILD_TIME__)) {
  Memory.version = __REVISION__ + __BUILD_TIME__;
  log.info(`loading revision: ${__REVISION__} : ${__BUILD_TIME__}`);
}

Memory.username = Memory.username ||
  _.chain(Game.rooms)
    .map("controller")
    .flatten()
    .filter("my")
    .map("owner.username")
    .first();

export const loop = () => {
  console.log("hit");
};
