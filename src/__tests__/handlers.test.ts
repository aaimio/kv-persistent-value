import makeServiceWorkerEnv from 'service-worker-mock';
import {
  createWorkerRequestHandler,
  handle404Request,
  handleAccessTokenRequest,
  handleGetValueRequest,
  handleSetMultipleValuesRequest,
  handleSetValueRequest,
} from '../handlers';

describe('handler tests', () => {
  beforeEach(() => {
    Object.assign(globalThis, makeServiceWorkerEnv());
  });

  it('handleAccessTokenRequest', async () => {
    (globalThis as any).crypto = { randomUUID: () => '1000% random' };
    (globalThis as any).kvPersistentValues = {
      get: async () => null,
      put: async () => {
        void 1;
      },
    };
    const result = await handleAccessTokenRequest();
    expect(result.status).toEqual(200);
    expect(await result.json()).toEqual({
      accessToken: '1000% random',
    });
  });

  it('handleGetValueRequest', async () => {
    (globalThis as any).kvPersistentValues = {
      get: async (_keyName: string, outputType: 'text' | 'json') => {
        if (outputType === 'json') {
          return JSON.parse('123');
        }

        return '123';
      },
      put: async () => {
        void 1;
      },
    };

    const fakeRequest1 = {
      locals: {
        'x-access-token': '123',
        key: 'some_key',
      },
      parsedUrl: new URL('https://persistent.aaim.io/values/get?key=some_key'),
    };

    const result1 = await handleGetValueRequest(fakeRequest1 as any);
    expect(result1.status).toBe(200);
    expect(await result1.json()).toEqual({
      accessToken: '123',
      key: 'some_key',
      value: '123',
    });

    const fakeRequest2 = {
      locals: {
        'x-access-token': '123',
        key: 'some_key',
      },
      parsedUrl: new URL('https://persistent.aaim.io/values/get?key=some_key&output=json'),
    };

    const result2 = await handleGetValueRequest(fakeRequest2 as any);
    expect(result2.status).toBe(200);
    expect(await result2.json()).toEqual({
      accessToken: '123',
      key: 'some_key',
      value: 123,
    });
  });

  it('handleSetValueRequest', async () => {
    (globalThis as any).kvPersistentValues = {
      get: async (_keyName: string, outputType: 'text' | 'json') => {
        if (outputType === 'json') {
          return JSON.parse('123');
        }

        return '123';
      },
      put: async () => {
        void 1;
      },
    };

    const fakeRequest1 = {
      locals: {
        'x-access-token': '123',
        key: 'some_key',
        value: 123,
      },
      parsedUrl: new URL('https://persistent.aaim.io/values/set?key=some_key'),
    };

    const result1 = await handleSetValueRequest(fakeRequest1 as any);
    expect(result1.status).toBe(200);
    expect(await result1.json()).toEqual({
      accessToken: '123',
      key: 'some_key',
      value: 123,
    });

    const fakeRequest2 = {
      locals: {
        'x-access-token': '123',
        key: 'some_key',
        value: '123',
      },
      parsedUrl: new URL('https://persistent.aaim.io/values/set?key=some_key'),
    };

    const result2 = await handleSetValueRequest(fakeRequest2 as any);
    expect(result2.status).toBe(200);
    expect(await result2.json()).toEqual({
      accessToken: '123',
      key: 'some_key',
      value: '123',
    });
  });

  it('handleSetMultipleValuesRequest', async () => {
    (globalThis as any).kvPersistentValues = {
      get: async () => null,
      put: async () => {
        void 1;
      },
    };

    const fakeRequest1 = {
      locals: {
        'x-access-token': '123',
        values: {
          firstValue: 1,
          secondValue: 2,
          thirdValue: 3,
          fourthValue: '4',
          fifthValue: true,
        },
      },
      parsedUrl: new URL('https://persistent.aaim.io/values/get?key=some_key'),
    };

    const result1 = await handleSetMultipleValuesRequest(fakeRequest1 as any);
    expect(result1.status).toEqual(200);
    expect(await result1.json()).toEqual({
      accessToken: '123',
      values: {
        firstValue: 1,
        secondValue: 2,
        thirdValue: 3,
        fourthValue: '4',
        fifthValue: true,
      },
    });
  });

  it('handle404Request', async () => {
    const result1 = handle404Request();
    expect(result1.status).toEqual(404);
  });

  it('creates a worker request handler', () => {
    const fakeRouterHandle = jest.fn();
    const workerRequestHandler = createWorkerRequestHandler({ handle: fakeRouterHandle } as any);
    expect(workerRequestHandler).toBeInstanceOf(Function);
    workerRequestHandler({
      respondWith: () => {
        void 1;
      },
      request: '100% a request',
    } as any);
    expect(fakeRouterHandle).toBeCalledWith('100% a request');
  });
});
