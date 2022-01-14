import type { JSONSchemaType } from 'ajv'

export const GITHUB_REPO_PROPERTY: JSONSchemaType<unknown>['properties'] = {
  'x-github-repo': {
    type: 'string',
    minLength: 3,
    maxLength: 1024,
  },
}

export const ACCESS_TOKEN_PROPERTY: JSONSchemaType<unknown>['properties'] = {
  'x-access-token': {
    type: 'string',
    minLength: 36,
    maxLength: 36,
  },
}

export const KEY_PROPERTY: JSONSchemaType<unknown>['properties'] = {
  key: {
    type: 'string',
    minLength: 1,
    maxLength: 1024,
  },
}

export const VALUE_PROPERTY: JSONSchemaType<unknown>['properties'] = {
  value: {
    oneOf: [
      {
        type: 'string',
        minLength: 1,
        maxLength: 1024,
      },
      {
        type: 'number',
      },
      {
        type: 'boolean',
      },
    ],
  },
}

export const VALUES_PROPERTY: JSONSchemaType<unknown>['properties'] = {
  values: {
    type: 'object',
  },
}
