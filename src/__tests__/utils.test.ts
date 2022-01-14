import { createJSONResponse, createNamespacedKey, sanitiseValue } from '../utils';
import makeServiceWorkerEnv from 'service-worker-mock';

describe('utils tests', () => {
  beforeEach(() => {
    Object.assign(globalThis, makeServiceWorkerEnv());
  });

  it('creates a JSON response', async () => {
    const result1 = createJSONResponse(undefined, 201);
    expect(result1.status).toEqual(201);
    expect(await result1.text()).toEqual('');

    const result2 = createJSONResponse({ key: 'some_key', value: '123' }, 200);
    expect(result2.status).toEqual(200);
    expect(await result2.json()).toEqual({ key: 'some_key', value: '123' });
  });

  it('creates a "namespaced" key', async () => {
    const result1 = createNamespacedKey('access_token', 'some_key');
    expect(result1).toEqual('access_token|some_key');

    // __should__ be fine 🤔
    const result2 = createNamespacedKey('1|2|3|4|5', '6|7|8|9|10');
    expect(result2).toEqual('1|2|3|4|5|6|7|8|9|10');
  });

  it('sanitises a value before putting it into the KV store', () => {
    expect(sanitiseValue(true)).toEqual('true');
    expect(sanitiseValue(255)).toEqual('255');
    expect(sanitiseValue('Hello World')).toEqual('Hello World');
  });
});
