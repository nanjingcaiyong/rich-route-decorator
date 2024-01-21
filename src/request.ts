import { HttpMethod, Param, Parse } from './utils/route';
import 'reflect-metadata'

export const CONTROLLER_METADATA = 'controller';
export const ROUTE_METADATA = 'method';
export const PARAM_METADATA = 'param';
export const PARSE_METADATA = 'parse';

export function Controller(path = ''): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, path, target);
  };
}

export function createMethodDecorator(method: HttpMethod = 'get') {
  return (path = '/'): MethodDecorator =>
    // target：当前类实例，name：当前函数名，descriptor：当前属性（函数）的描述符
    (_target: any, _name: string, descriptor: any) => {
      Reflect.defineMetadata(
        ROUTE_METADATA,
        { type: method, path },
        descriptor.value,
      );
    };
}

export function createParamDecorator(type: Param) {
  return (key?: string): ParameterDecorator =>
    // target：当前类实例，name：当前函数名，index：当前函数参数顺序
    (target: any, name: any, index: number) => {
      const preMetadata = Reflect.getMetadata(PARAM_METADATA, target, name) || [];
      const newMetadata = [{ key, index, type }, ...preMetadata];
      Reflect.defineMetadata(PARAM_METADATA, newMetadata, target, name);
    };
}

export function Parse(type: Parse): ParameterDecorator {
  return (target: any, name: any, index: any) => {
    const preMetadata = Reflect.getMetadata(PARAM_METADATA, target, name) || [];
    const newMetadata = [{ type, index }, ...preMetadata];

    Reflect.defineMetadata(PARSE_METADATA, newMetadata, target, name);
  };
}

export const Get = createMethodDecorator('get');
export const Head = createMethodDecorator('head');
export const Post = createMethodDecorator('post');
export const Delete = createMethodDecorator('delete');
export const Put = createMethodDecorator('put');
export const Body = createParamDecorator('body');
export const Headers = createParamDecorator('headers');
export const Cookies = createParamDecorator('cookies');
export const Query = createParamDecorator('query');