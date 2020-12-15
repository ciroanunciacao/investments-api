import { mergeWith, isObject } from 'lodash';

export function getEnumType<T extends {[key: number]: string | number}>(
  value: number | string, e: any,
): T[keyof T] {
  const keys = Object.keys(e);
  for (let i = 0; i < keys.length; i += 1) {
    if (value === e[keys[i]]) {
      return e[keys[i]];
    }
  }
  return undefined;
}

export function getEnumValues<T extends {[key: number]: string}>(e: T): string[] {
  return Object.values(e);
}

export function deepMerge<TObject, TSource>(object: TObject, source: TSource): TObject & TSource {
  return mergeWith(object, source, (a: any, b: any) => {
    if (!isObject(b)) return b;
    return Array.isArray(a) && Array.isArray(b)
      ? [...a, ...b]
      : { ...a, ...b };
  });
}
