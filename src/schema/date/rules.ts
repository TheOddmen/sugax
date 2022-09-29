//
//  rules.ts
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
import { ValidateError } from '../error';

export const min = (
  value: any,
  error: (attrs: Record<string, string>) => ValidateError,
  min: Date
) => _.isDate(value) && value >= min ? undefined : error({ min: `${min}` });

export const max = (
  value: any,
  error: (attrs: Record<string, string>) => ValidateError,
  max: Date
) => _.isDate(value) && value <= max ? undefined : error({ max: `${max}` });

export const lessThan = (
  value: any,
  error: (attrs: Record<string, string>) => ValidateError,
  less: Date
) => _.isDate(value) && value < less ? undefined : error({ less: `${less}` });

export const moreThan = (
  value: any,
  error: (attrs: Record<string, string>) => ValidateError,
  more: Date
) => _.isDate(value) && value > more ? undefined : error({ more: `${more}` });
