import {
  CONTROLLER_METADATA,
  ROUTE_METADATA,
  PARAM_METADATA,
  PARSE_METADATA
} from './request';
import { RouteType } from './utils/route';
import 'reflect-metadata'
import { Context } from 'koa';
import Router from '@koa/router'
import 'koa-body'
import * as Koa from "koa";
export type ParamType = {
  key: string,
  index: number,
  type: string
}

export type ParseType = {
  type: string,
  index: number, 
}

/**
 * @description 生成参数列表
 * @param paramList 参数配置
 * @param req 请求
 * @returns 
 */
export function makeParameters (paramList:ParamType[],  req: Koa.Request) {
  return paramList.reduce((args, param) => {
    const { key, index, type } = param;
    switch (type) {
      case 'query':
        args[index] = key ? req.query[key] : {...req.query}
        break;
      case 'body': 
        args[index] = key ? req.body[key] : {...req.body}
        break;
      case 'headers':
        args[index] = key ? req.headers[key.toLowerCase()] : req.headers
        break;
    }
    return args
  }, [])
}

/**
 * @description 入参类型转换
 * @param parseList 类型转换配置
 * @param args 待转换的参数
 */
export function conversionType (parseList:ParseType[], args: any[]) {
  return parseList.map(param => {
    const { type, index } = param;
    switch (type) {
      case 'number':
        args[index] = Number(args[index])
        break;
      case 'string':
        args[index] = String(args[index])
        break;
      case 'boolean':
        args[index] = Boolean(args[index])
        break;
    }
    return param
  })
}

/**
 *@description 提取参数注入controller
 * @param req 请求
 * @param res 响应
 * @param paramList 参数声明列表
 * @param parseList 参数类型列表
 * @returns 
 */
export function extractParameters (
  req: Koa.Request,
  res: Koa.Response,
  paramList: any[] = [],
  parseList: any[] = []
) {
  const args = conversionType(parseList, makeParameters(paramList, req))
  return [...args, req, res]
}

/**
 * @description 处理请求参数和返回浏览器数据
 * @param func Contoller 中的函数
 * @returns 
 */
export function handlerFactory( func: (...args: any[]) => any, paramList: any[], parseList: []) {
  return async (ctx: Context, next: Koa.Next) => {
    try {
      // 合并query 和 params
      // const args = Object.assign({}, ctx.request.body, ctx.request.query)
      const args = extractParameters(ctx.request, ctx.response, paramList, parseList)
      const result = await func(...args)
      ctx.body = result
    } catch (err) {
      next();
    }
  };
}
/**
 * @description 路由注册
 * @param controllerStore 
 * @param router 
 */

export function register(
  controllerStore: Record<string, any>,
  router: Router
) {
  Object.values(controllerStore).forEach(instance => {
    const controllerMetadata: string = Reflect.getMetadata(
      CONTROLLER_METADATA,
      instance.constructor,
    );

    const proto = Object.getPrototypeOf(instance);
    const routeNameArr = Object.getOwnPropertyNames(proto).filter(
      n => n !== 'constructor' && typeof proto[n] === 'function',
    );

    routeNameArr.forEach(routeName => {
      const routeMetadata: RouteType = Reflect.getMetadata(
        ROUTE_METADATA,
        proto[routeName],
      );
      let { type, path } = routeMetadata;
      const handler = handlerFactory(
        proto[routeName].bind(instance),
        Reflect.getMetadata(PARAM_METADATA, instance, routeName),
        Reflect.getMetadata(PARSE_METADATA, instance, routeName)
      );
      path = path === '/' ? '' : path
      router[type](controllerMetadata + path, handler);
    });
  });
}
