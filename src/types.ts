export type AccessToken = string;
export type GitHubRepo = string;
export type Key = string;
export type Value = string | number | boolean;
export type Values = { [key: string]: Value };

export interface Locals {
  'x-access-token': AccessToken;
  'x-github-repo': GitHubRepo;
  key: Key;
  value: Value;
  values: Values;
}

export interface RequestWithParsedURL extends Request {
  parsedUrl: URL;
}

export interface RequestWithLocals extends Request {
  locals: Locals;
}
