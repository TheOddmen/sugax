//
//  index.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
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
import { useStableCallback } from '../stable';
import { useAsyncDebounce } from '../debounce';
import { Config, Fetch, FetchWithIterable } from './types';

export const useAsyncResource = <T>(
  config: Fetch<T> | Config<Fetch<T>>,
  deps?: React.DependencyList,
) => {

  const fetch = _.isFunction(config) ? config : config.fetch;
  const debounce = _.isFunction(config) ? {} : config.debounce;

  const [state, setState] = React.useState<{
    count?: number;
    resource?: T;
    error?: Error;
    token?: string;
    abort?: AbortController;
  }>({});

  const _refresh = useAsyncDebounce(async (abort: AbortController) => {

    const token = _.uniqueId();
    setState(state => ({ ...state, token, abort }));

    const _reset: typeof setState = (next) => setState(state => state.token === token ? ({
      ...(_.isFunction(next) ? next(_.omit(state, 'resource', 'error')) : next),
      count: (state.count ?? 0) + 1,
    }) : state);

    const _update: typeof setState = (next) => setState(state => state.token === token ? ({
      ...(_.isFunction(next) ? next(state) : next),
    }) : state);

    try {

      const resource = await fetch({
        abortSignal: abort.signal,
        dispatch: (next) => {
          _update(state => ({
            ...state,
            resource: _.isFunction(next) ? next(state.resource) : next,
          }));
        },
      });

      _reset(state => ({ resource: resource ?? state.resource }));

    } catch (error) {

      _reset(state => ({
        resource: state.resource,
        error: error as Error,
      }));
    }

  }, debounce ?? {});

  React.useEffect(() => {
    const controller = new AbortController();
    void _refresh(controller);
    return () => controller.abort();
  }, deps ?? []);

  const _cancelRef = useStableCallback((reason?: any) => { state.abort?.abort(reason) });
  const _refreshRef = useStableCallback(() => _refresh(new AbortController()));

  return {
    count: state.count ?? 0,
    loading: !_.isNil(state.abort),
    resource: state.resource,
    error: state.error,
    cancel: _cancelRef,
    refresh: _refreshRef,
  };
}

export const useAsyncIterableResource = <T>(
  config: FetchWithIterable<T> | Config<FetchWithIterable<T>>,
  deps?: React.DependencyList,
) => {
  const fetch = _.isFunction(config) ? config : config.fetch;
  const debounce = _.isFunction(config) ? {} : config.debounce;
  return useAsyncResource<T[]>({
    fetch: async ({ dispatch, abortSignal }) => {
      const resource = await fetch({ abortSignal });
      for await (const item of resource) {
        dispatch(items => items ? [...items, item] : [item]);
      }
    },
    debounce,
  }, deps);
}
