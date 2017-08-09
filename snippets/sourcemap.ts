/**
 * "source-map": "github:DefinitelyTyped/DefinitelyTyped/source-map/index.d.ts#cd4debea25a280da0808d4ff2ca5a4bdb34bd28b"
 * [06:39]
 * you'll need some source-map typings
 *
 * [6:40]
 * And that's assuming you have main.js.map
 *
 * [06:40]
 * @lexxicon - and, just checking, do you have a `module.exports =` at the start of your .map?
 *
 * look into rollup vs webpack
 */

export class ErrorMapper {
  private static _consumer: SourceMapConsumer | undefined;

  // only load the source map when it's actually needed since it can be quite large
  private static get consumer(): SourceMapConsumer {
    if (this._consumer) {
      return this._consumer;
    } else {
      this._consumer = new SourceMapConsumer(require("main.js.map"));
      return this._consumer;
    }
  }

  public static getMappedStack(error: Error): string {
    // regex to match name, file, line and column
    const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
    let match: RegExpExecArray | null;
    let outStack = error.toString();

    while (match = re.exec(error.stack as string)) {
      if (match[2] === "main") {
        const pos = this.consumer.originalPositionFor({
          line: parseInt(match[3]),
          column: parseInt(match[4])
        });

        if (pos.line != null) {
          if (pos.name) {
            outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
          } else {
            if (match[1]) {
              outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
            } else {
              outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
            }
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return outStack;
  }
}
