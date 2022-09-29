//
//  types.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2022 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import * as common_rules from './common_rules';

import { ValidateError } from '../error';

type Internals<T> = {
  type: string;
  default?: T;
  rules: ({ rule: string, validate: (value: any) => boolean })[];
  transform: (value: any) => any;

  validate?: (
    internals: Internals<T>,
    value: any,
    path?: string | string[],
  ) => void;

}

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

type RuleType = Record<string, (...args: any) => boolean>

type MappedRules<T, R extends RuleType> = {
  [K in keyof R]: (...args: Parameters<OmitFirstArg<R[K]>>) => ISchema<T, R>;
}

export type ISchema<T, R extends RuleType> = {

  strict(): ISchema<T, R>

  default(value: T): ISchema<T, R>

  getDefault(): T | undefined

  transform(
    t: (value: any) => any
  ): ISchema<T, R>

  validate(
    value: any,
    path?: string | string[],
  ): void

} & MappedRules<T, typeof common_rules & R>

export type TypeOfSchema<S> = S extends ISchema<infer T, any> ? T : S;

export const SchemaBuilder = <T, R extends RuleType>(
  internals: Internals<T>,
  rules: R,
  extension: (
    internals: Internals<T>,
    builder: (internals: Partial<Internals<T>>) => ISchema<T, R>
  ) => Partial<ISchema<T, R>>
): ISchema<T, R> => {

  const builder = (v: Partial<Internals<T>>) => SchemaBuilder({ ...internals, ...v }, rules, extension);

  const RulesLoader = <R2 extends RuleType>(
    rules: R2
  ) => _.mapValues(rules, (rule, key) => (...args: any) => builder({
    rules: [...internals.rules, { rule: key, validate: (v) => rule(v, ...args) }],
  }));

  const schema = {

    strict() {
      return schema;
    },

    default(
      value: T
    ) {
      return builder({ default: value });
    },

    getDefault() {
      return internals.default;
    },

    transform(
      t: (value: any) => any
    ) {
      return builder({ transform: t });
    },

    validate(
      value: any,
      path?: string | string[],
    ) {
      const _value = internals.transform(value);
      for (const rule of internals.rules) {
        if (!rule.validate(_value)) {
          throw new ValidateError(internals.type, rule.rule, _.toPath(path));
        }
      };
      internals.validate?.(internals, _value, path);
    },

    ...RulesLoader(common_rules),
    ...RulesLoader(rules),
    ...extension(internals, builder),
    
  };

  return schema;
};
