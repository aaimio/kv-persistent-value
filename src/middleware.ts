import { StatusError } from 'itty-router-extras';
import { Locals, RequestWithParsedURL, Value, Values } from './types';
import {
  accessTokenValidator,
  getValueValidator,
  setMultipleValuesValidator,
  setValueValidator,
} from './ajv';

export const createValidationMiddleware =
  (
    requestParamsValidator:
      | typeof accessTokenValidator
      | typeof getValueValidator
      | typeof setValueValidator
      | typeof setMultipleValuesValidator,
    getLocals: (request: Request) => Promise<Partial<Locals>>,
    localsValidatorFns: ((
      locals: Partial<Locals>
    ) => Promise<[status: number, message: string] | null>)[] = []
  ) =>
  async (request: Request): Promise<void> => {
    const locals = await getLocals(request);
    const isValidRequest = requestParamsValidator(locals);

    if (!isValidRequest) {
      const { message } = (requestParamsValidator as any).errors[0];
      throw new StatusError(400, message);
    }

    /*
     * Additional validators are called after it is confirmed all the required
     * parameters were passed for this particular route (through ajv). The
     * parameters are set as a `locals` property on the `request` object.
     */
    for (let i = 0; i < localsValidatorFns.length; i++) {
      const customValidate = localsValidatorFns[i];
      const validationResult = await customValidate(locals);

      if (validationResult !== null) {
        throw new StatusError(validationResult[0], validationResult[1]);
      }
    }

    // Pin locals to "request" so we can access them in the handlers
    (request as Request & { locals: Partial<Locals> }).locals = locals;
  };

/**
 * Verifies whether the access token exists in the KV store
 */
export const verifyAccessTokenInKVStore = async (
  values: Partial<Locals>
): Promise<[number, string] | null> => {
  const accessToken = values['x-access-token'] as string;

  return accessToken && (await kvPersistentValues.get(accessToken)) === accessToken
    ? null
    : [401, 'Access token is invalid'];
};

/**
 * Ensures the number of keys in a request to `/values/set_multiple` stay below
 * a certain threshold
 */
export const verifyMaxValues = async (
  locals: Partial<Locals>
): Promise<[number, string] | null> => {
  const maxValues = 5;
  const values = locals.values || {};

  if (Object.keys(values).length > maxValues) {
    return [413, `Too many values, the limit is ${maxValues} values per request`];
  }

  return null;
};

/**
 * Takes a request's plain string URL and turns it into a "URL" instance
 * then assigns it back to the `request`'s `parsedUrl` property
 */
export const setParsedUrl = (request: Request): void => {
  const url = new URL(request.url);
  (request as RequestWithParsedURL).parsedUrl = url;
};

/**
 * Gets the "locals" values from a `/values/new_access_token` request. These can later
 * be accessed in handlers.
 */
export const getAccessTokenRequestLocals = async (request: Request): Promise<Partial<Locals>> => {
  return {
    'x-github-repo': request.headers.get('x-github-repo') || undefined,
  };
};

/**
 * Gets the "locals" values from a `/values/get` request. These can later be accessed in
 * handlers.
 */
export const getGetValueRequestLocals = async (
  request: RequestWithParsedURL
): Promise<Partial<Locals>> => {
  return {
    'x-access-token': request.headers.get('x-access-token') || undefined,
    key:
      // Below happens if "setParsedURL" middleware is executed before this one
      (request.parsedUrl
        ? request.parsedUrl.searchParams.get('key')
        : new URL(request.url).searchParams.get('key')) || undefined,
  };
};

/**
 * Gets the "locals" values from a `/values/set` request. These can later be accessed in
 * handlers.
 */
export const getSetValueRequestLocals = async (request: Request): Promise<Partial<Locals>> => {
  try {
    return {
      'x-access-token': request.headers.get('x-access-token') || undefined,
      key: new URL(request.url).searchParams.get('key') || undefined,
      value: (await request.json<{ value: Value }>())?.value || undefined,
    };
  } catch {
    return {};
  }
};

/**
 * Gets the "locals" values from a `/values/set_multiple` request. These can
 * later be accessed in handlers.
 */
export const getSetMultipleValuesRequestLocals = async (
  request: Request
): Promise<Partial<Locals>> => {
  try {
    return {
      'x-access-token': request.headers.get('x-access-token') || undefined,
      values: await request.json<Values>(),
    };
  } catch {
    return {};
  }
};

/**
 * Validates whether the request to `/values/new_access_token` has all the
 * required parameters.
 */
export const validateAccessTokenRequest = createValidationMiddleware(
  accessTokenValidator,
  getAccessTokenRequestLocals
);

/**
 * Validates whether the request to `/values/get` has all the
 * required parameters.
 */
export const validateGetValueRequest = createValidationMiddleware(
  getValueValidator,
  getGetValueRequestLocals as any,
  [verifyAccessTokenInKVStore]
);

/**
 * Validates whether the request to `/values/set` has all the
 * required parameters.
 */
export const validateSetValueRequest = createValidationMiddleware(
  setValueValidator,
  getSetValueRequestLocals,
  [verifyAccessTokenInKVStore]
);

/**
 * Validates whether the request to `/values/set_multiple` has all the required
 * parameters.
 */
export const validateSetMultipleValuesRequest = createValidationMiddleware(
  setMultipleValuesValidator,
  getSetMultipleValuesRequestLocals,
  [verifyMaxValues, verifyAccessTokenInKVStore]
);
