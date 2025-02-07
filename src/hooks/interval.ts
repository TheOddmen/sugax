//
//  interval.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
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
import React from 'react';

export const useInterval = (ms?: number) => {
  const [value, setValue] = React.useState(0);
  const time = React.useRef(Date.now());
  const reset = React.useCallback(() => { time.current = Date.now(); }, []);
  React.useEffect(() => {
    const interval = setInterval(() => { setValue(Date.now() - time.current); }, ms);
    return () => clearInterval(interval);
  }, []);
  return { interval: value, reset };
};

export const useTimer = (ms?: number) => {
  const [paused, setPaused] = React.useState(true);
  const [value, setValue] = React.useState(0);
  const time = React.useRef(Date.now());
  React.useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => { setValue(Date.now() - time.current); }, ms);
    return () => clearInterval(interval);
  }, [paused]);
  const start = React.useCallback(() => {
    time.current = Date.now();
    setPaused(false);
  }, []);
  const stop = React.useCallback(() => { setPaused(true); }, []);
  const reset = React.useCallback(() => { setValue(0); }, []);
  return {
    interval: value,
    paused,
    start,
    stop,
    reset,
  };
}
