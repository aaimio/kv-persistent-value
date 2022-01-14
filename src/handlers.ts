import { ThrowableRouter } from 'itty-router-extras';
import { RequestWithLocals, RequestWithParsedURL, Values } from './types';
import { createJSONResponse, createNamespacedKey, sanitiseValue } from './utils';

export const handleAccessTokenRequest = async (): Promise<Response> => {
  let accessToken: string;

  do {
    accessToken = crypto.randomUUID();
  } while ((await kvPersistentValues.get(accessToken)) !== null);

  await kvPersistentValues.put(accessToken, accessToken, {
    metadata: { lastUsed: Date.now() },
  });

  return createJSONResponse({ accessToken }, 200);
};

export const handleGetValueRequest = async (
  request: RequestWithLocals & RequestWithParsedURL
): Promise<Response> => {
  const { 'x-access-token': accessToken, key } = request.locals;
  const { parsedUrl } = request;
  const namespacedKey = createNamespacedKey(accessToken, key);
  const outputType = parsedUrl.searchParams.get('output') === 'json' ? 'json' : 'text';
  const value = await kvPersistentValues.get(namespacedKey, outputType as any);

  if (value !== null) {
    await kvPersistentValues.put(namespacedKey, value, {
      metadata: { lastUsed: Date.now() },
    });
  }

  return createJSONResponse(
    {
      accessToken,
      key,
      value,
    },
    200
  );
};

export const handleSetValueRequest = async (request: RequestWithLocals): Promise<Response> => {
  const { 'x-access-token': accessToken, key, value } = request.locals;
  const namespacedKey = createNamespacedKey(accessToken, key);
  const sanitisedValue = sanitiseValue(value);

  await Promise.all([
    kvPersistentValues.put(namespacedKey, sanitisedValue, {
      metadata: { lastUsed: Date.now() },
    }),
    kvPersistentValues.put(accessToken, accessToken, {
      metadata: { lastUsed: Date.now() },
    }),
  ]);

  return createJSONResponse(
    {
      accessToken,
      key,
      value,
    },
    200
  );
};

export const handleSetMultipleValuesRequest = async (
  request: RequestWithLocals
): Promise<Response> => {
  const { 'x-access-token': accessToken, values } = request.locals;
  const keys = Object.keys(values);

  await Promise.all(
    keys.map((key) => {
      const namespacedKey = createNamespacedKey(accessToken, key);
      const sanitisedValue = sanitiseValue(values[key]);

      return kvPersistentValues.put(namespacedKey, sanitisedValue, {
        metadata: { lastUsed: Date.now() },
      });
    })
  );

  return createJSONResponse(
    {
      accessToken,
      values: keys.reduce((returnValues: Values, key) => {
        returnValues[key] = values[key];
        return returnValues;
      }, {}),
    },
    200
  );
};

export const handle404Request = (): Response => {
  return createJSONResponse({ error: 'Not found' }, 404);
};

export const createWorkerRequestHandler =
  (router: ThrowableRouter<unknown>) =>
  (event: FetchEvent): void =>
    event.respondWith(router.handle(event.request));
