import { StatusError } from 'itty-router-extras';
import {
  createValidationMiddleware,
  getAccessTokenRequestLocals,
  getGetValueRequestLocals,
  getSetMultipleValuesRequestLocals,
  getSetValueRequestLocals,
  setParsedUrl,
  verifyAccessTokenInKVStore,
  verifyMaxValues,
} from '../middleware';
import { RequestWithLocals, RequestWithParsedURL } from '../types';

describe('middleware tests', () => {
  it('createValidationMiddleware: creates a validation middleware (!isValidRequest)', (done) => {
    const fakeValidatorFn = jest.fn(() => false);
    const fakeGetLocals = jest.fn();
    const validationMiddleware = createValidationMiddleware(fakeValidatorFn, fakeGetLocals);

    Object.defineProperty(fakeValidatorFn, 'errors', { value: [{ message: 'Oops' }] });

    validationMiddleware({} as any)
      .then(() => {
        expect(true).toEqual(false);
      })
      .catch((error) => {
        expect(error).toBeInstanceOf(StatusError);
        expect(error.message).toEqual('Oops');
      })
      .finally(done);
  });

  it('createValidationMiddleware: creates a validation middleware (additionalValidator fails)', (done) => {
    const fakeValidatorFn = jest.fn(() => true);
    const fakeGetLocals = jest.fn();
    const additionalValidator = jest.fn(
      async (): Promise<[number, string] | null> => [400, 'Hold it right there.']
    );
    const validationMiddleware = createValidationMiddleware(fakeValidatorFn, fakeGetLocals, [
      additionalValidator,
    ]);

    validationMiddleware({} as any)
      .then(() => {
        expect(true).toEqual(false);
      })
      .catch((error) => {
        expect(error).toBeInstanceOf(StatusError);
        expect(error.message).toEqual('Hold it right there.');
      })
      .finally(done);
  });

  it('createValidationMiddleware: creates a validation middleware (success)', (done) => {
    let request: RequestWithLocals;

    const fakeValidatorFn = async () => true;
    const fakeGetLocals = async (passedRequest: RequestWithLocals) => {
      request = passedRequest;
      return { 'x-github-repo': 'aaimio/kv-persistent-value' };
    };
    const additionalValidator = async () => null;

    const validationMiddleware = createValidationMiddleware(
      fakeValidatorFn as any,
      fakeGetLocals as any,
      [additionalValidator as any]
    );

    validationMiddleware({} as any)
      .then(() => {
        expect(request).toHaveProperty('locals');
        expect(request.locals).toHaveProperty('x-github-repo');
        expect(request.locals['x-github-repo']).toEqual('aaimio/kv-persistent-value');
      })
      .finally(done);
  });

  it('verifyAccessTokenInKVStore: verifies whether an access token is in the KV store (valid token)', (done) => {
    (globalThis as any).kvPersistentValues = { get: async () => '123' };
    verifyAccessTokenInKVStore({ 'x-access-token': '123' })
      .then((result) => expect(result).toEqual(null))
      .finally(done);
  });

  it('verifyAccessTokenInKVStore: verifies whether an access token is in the KV store (invalid token)', (done) => {
    (globalThis as any).kvPersistentValues = { get: async () => null };
    verifyAccessTokenInKVStore({ 'x-access-token': '123' })
      .then((result) => {
        expect(typeof result?.[0]).toEqual('number');
        expect(typeof result?.[1]).toEqual('string');
      })
      .finally(done);
  });

  it('verifyMaxValues: it verifies whether a request has too many "values" or not', async () => {
    const [result1, result2, result3] = await Promise.all([
      verifyMaxValues({
        values: { 1: 'Lorem', 2: 'Ipsum', 3: 'Dolor', 4: 'Sit', 5: 'Amet' },
      }),
      verifyMaxValues({
        values: { 1: 'Lorem', 2: 'Ipsum', 3: 'Dolor', 4: 'Sit', 5: 'Amet', 6: 'Consectetur' },
      }),
      verifyMaxValues({} as any),
    ]);

    expect(result1).toEqual(null);
    expect(typeof result2?.[0]).toEqual('number');
    expect(typeof result2?.[1]).toEqual('string');
    expect(result3).toEqual(null);
  });

  it('setParsedUrl: It parsed "request"\'s URL and sets it as "parsedUrl" ', () => {
    const request = { url: 'https://persistent.aaim.io' };
    setParsedUrl(request as any);
    expect(request).toHaveProperty('parsedUrl');
    expect((request as RequestWithParsedURL).parsedUrl).toBeInstanceOf(URL);
    expect((request as RequestWithParsedURL).parsedUrl.hostname).toEqual('persistent.aaim.io');
  });

  it('getAccessTokenRequestLocals', async () => {
    const result1 = await getAccessTokenRequestLocals({ headers: { get: () => '123' } } as any);
    const result2 = await getAccessTokenRequestLocals({ headers: { get: () => null } } as any);
    expect(result1['x-github-repo']).toEqual('123');
    expect(result2['x-github-repo']).toEqual(undefined);
  });

  it('getGetValueRequestLocals', async () => {
    const result1 = await getGetValueRequestLocals({
      headers: { get: () => '123' },
      url: 'https://persistent.aaim.io',
    } as any);
    const result2 = await getGetValueRequestLocals({
      headers: { get: () => null },
      url: 'https://persistent.aaim.io',
    } as any);
    const result3 = await getGetValueRequestLocals({
      headers: { get: () => null },
      url: 'https://persistent.aaim.io',
      parsedUrl: new URL('https://persistent.aaim.io/?key=1337'),
    } as any);

    expect(result1['x-access-token']).toEqual('123');
    expect(result2['x-access-token']).toEqual(undefined);
    expect(result3.key).toEqual('1337');
  });

  it('getSetValueRequestLocals', async () => {
    const result1 = await getSetValueRequestLocals({
      headers: { get: () => '123' },
      url: 'https://persistent.aaim.io',
      json: async () => {
        return { value: 'Hello there!' };
      },
    } as any);
    const result2 = await getSetValueRequestLocals({
      headers: { get: () => null },
      url: 'https://persistent.aaim.io',
      json: async () => {
        void 1;
      },
    } as any);
    const result3 = await getSetValueRequestLocals({
      headers: { get: () => null },
      url: 'https://persistent.aaim.io',
      json: async () => {
        throw new Error('Critically dangerous');
      },
    } as any);

    expect(result1['value']).toEqual('Hello there!');
    expect(result2['value']).toEqual(undefined);
    expect(result3['value']).toEqual(undefined);
  });

  it('getSetMultipleValuesRequestLocals', async () => {
    const result1 = await getSetMultipleValuesRequestLocals({
      headers: { get: () => '123' },
      url: 'https://persistent.aaim.io',
      json: async () => {
        return { value1: 'Hello there!', value2: 'Goodbye now!' };
      },
    } as any);
    const result2 = await getSetMultipleValuesRequestLocals({
      headers: { get: () => null },
      url: 'https://persistent.aaim.io',
      json: async () => {
        void 1;
      },
    } as any);
    const result3 = await getSetMultipleValuesRequestLocals({
      headers: { get: () => null },
      url: 'https://persistent.aaim.io',
      json: async () => {
        throw new Error('Critically dangerous');
      },
    } as any);

    expect(result1['values']).toEqual({ value1: 'Hello there!', value2: 'Goodbye now!' });
    expect(result2['values']).toEqual(undefined);
    expect(result3['values']).toEqual(undefined);
  });
});
