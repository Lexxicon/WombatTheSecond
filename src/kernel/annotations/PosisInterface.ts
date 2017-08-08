export function posisInterface(interfaceId: keyof PosisInterfaces): (target: any, propertyKey: string) => any {
  return function(target: any, propertyKey: string): any {
    let value: IPosisExtension;
    return {
      get() {
        if (!value) {
          value = this.context.queryPosisInterface(interfaceId);
        }
        return value;
      }
    };
  };
}
