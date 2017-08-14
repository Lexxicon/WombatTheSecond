// I don't know how to tuse the command arg

export function consoleLink(text: string, command: string) {
  return "<b>[<a href=\"javascript:$('body').injector().get('Api').post('user/console', {shard: '" +
    Game.shard.name + "',expression:'" + command + "'})\">" + text + "</a>]</b>";
}
// doesn't seem to work?
console.log(consoleLink("test", "console.log(`hi`);"));
