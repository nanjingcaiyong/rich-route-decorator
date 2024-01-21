export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head';
export type Param = 'params' | 'query' | 'body' | 'headers' | 'cookies';
export type Parse = 'number' | 'string' | 'boolean';

export interface ControllerType {
  path: string;
  target: object;
}

export interface RouteType {
  target: object;
  name: string;
  type: HttpMethod;
  path: string;
  func: (...args: any[]) => any;
  loaded?: boolean;
}

export interface ParamType {
  key: string;
  index: number;
  type: Param;
  name: string;
}

export interface ParseType {
  type: Parse;
  index: number;
  name: string;
}
