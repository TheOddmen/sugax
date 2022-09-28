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

export interface ISchema<Type> {

  default(value: Type): ISchema<Type>

  getDefault(): Type | undefined

}

type Internals<Type> = {
  type: string;
  default?: Type;
  rules: ({ rule: string, validate: (value: any) => boolean })[];
  transform: (value: any) => any;
}

export class ValidateError extends Error {

  type: string;
  rule: string;
  path?: string[];

  constructor(
    type: string,
    rule: string,
    path?: string[]
  ) {
    super();
    this.type = type;
    this.rule = rule;
    this.path = path;
  }
}

export const schema_builder = <Type, P>(
  internals: P & Internals<Type>,
  extension: (internals: P & Internals<Type>, builder: (internals: P & Internals<Type>) => ISchema<Type>) => any
): ISchema<Type> => ({

  default(
    value: Type
  ) {
    return schema_builder({ ...internals, default: value }, extension);
  },

  getDefault() {
    return internals.default;
  },

  transform(
    t: (value: any) => any
  ) {
    return schema_builder({ ...internals, transform: t }, extension);
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
  },

  ..._.mapValues(common_rules, (rule, key) => () => schema_builder({
    ...internals,
    rules: [...internals.rules, { rule: key, validate: rule }],
  }, extension)),

  ...extension(internals, (v) => schema_builder({ ...internals, ...v }, extension)),

});
