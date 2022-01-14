import { JSONSchemaType } from 'ajv';
import { AccessToken, GitHubRepo, Key, Value, Values } from '../../src/types';
import {
  ACCESS_TOKEN_PROPERTY,
  GITHUB_REPO_PROPERTY,
  KEY_PROPERTY,
  VALUES_PROPERTY,
  VALUE_PROPERTY,
} from './properties';

export const accessTokenSchema: JSONSchemaType<{
  'x-github-repo': GitHubRepo;
}> = {
  required: ['x-github-repo'],
  type: 'object',
  properties: {
    ...GITHUB_REPO_PROPERTY,
  },
};

export const getValueSchema: JSONSchemaType<{
  'x-access-token': AccessToken;
  key: Key;
}> = {
  type: 'object',
  required: ['x-access-token', 'key'],
  properties: {
    ...ACCESS_TOKEN_PROPERTY,
    ...KEY_PROPERTY,
  },
};

export const setValueSchema: JSONSchemaType<{
  'x-access-token': AccessToken;
  key: Key;
  value: Value;
}> = {
  type: 'object',
  required: ['x-access-token', 'key', 'value'],
  properties: {
    ...ACCESS_TOKEN_PROPERTY,
    ...KEY_PROPERTY,
    ...VALUE_PROPERTY,
  },
};

export const setMultipleValuesSchema: JSONSchemaType<{
  'x-access-token': AccessToken;
  values: Values;
}> = {
  type: 'object',
  required: ['x-access-token', 'values'],
  properties: {
    ...ACCESS_TOKEN_PROPERTY,
    ...VALUES_PROPERTY,
  },
};
