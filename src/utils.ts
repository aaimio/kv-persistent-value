import { Value } from './types';

/**
 * Creates a JSON response with correct headers set
 */
export const createJSONResponse = (
  body: { [key: string]: unknown } | undefined,
  status: number
): Response => {
  const stringifiedBody = body ? JSON.stringify(body) : '';

  return new Response(stringifiedBody, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Content-Length': `${stringifiedBody.length}`,
    },
  });
};

/**
 * There are no nested keys and values in the KV store, so values are stored as
 * an "access_token/key_name" to ensure they're not overwritten by others trying
 * to store values under the same key.
 */
export const createNamespacedKey = (accessToken: string, key: string): string => {
  return `${accessToken}|${key}`;
};

/**
 * Converts a `Value` into a string before writing it to the KV store. A `Value`
 * can either be a `string`, `number` or `boolean`. A user can later restore
 * this type by specifying an `output` query parameter with value `json`.
 */
export const sanitiseValue = (value: Value): string => {
  if (typeof value === 'boolean') {
    return new Boolean(value).toString();
  }

  return `${value}`;
};
