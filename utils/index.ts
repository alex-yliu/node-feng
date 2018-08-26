
export interface ConstructorFunction extends Function {
    new (...args: any[]): any;
}

export type AnyFunction = (...args: any[]) => any;

export function bind(fn: any, context: any): AnyFunction {
    if (fn.bind) {
      return fn.bind(context);
    } else {
      return function __autobind__() {
        return fn.apply(context, arguments);
      };
    }
}
