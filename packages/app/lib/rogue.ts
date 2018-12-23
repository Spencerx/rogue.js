import React from 'react'
import connect from 'connect'
import rogueMiddleware from './rogueMiddleware'

export type RogueOptions = { 
  headTags?: string[], 
  bodyTags?: string[],
  renderToString?: Function 
}

export default class Rogue {
  app: any 
  preMiddlewares: Array<Function | [string, Function]>
  postMiddlewares: Array<Function | [string, Function]>
  initialized: boolean 

  constructor (App: React.ComponentType<any>, options: RogueOptions = {}) {
    this.app = connect() 
    this.preMiddlewares = []
    this.postMiddlewares = [rogueMiddleware(App, options)]
    this.initialized = false
  }
  
  /**
   * Get app middleware handler.
   */
  get render () {
    if (!this.initialized) this.initMiddleware()
    return this.app
  }

  /*
  * Middleware to be used before app middleware.
  */
  preuse (routeOrHandler: string | Function, handler?: Function) {
    if (handler) this.preMiddlewares.push([routeOrHandler as string, handler])
    else this.preMiddlewares.push(routeOrHandler as Function)
  }

  /*
  * Middleware to be used after app middleware.
  */
  use (routeOrHandler: string | Function, handler?: Function) {
    if (handler) this.postMiddlewares.push([routeOrHandler as string, handler])
    else this.postMiddlewares.push(routeOrHandler as Function)
  }

  /**
   * Start app listening for requests.
   */
  listen (port: number, ...args) {
    if (!this.initialized) this.initMiddleware()
    return this.app.listen(port, ...args)
  }

  private initMiddleware () {
    const { app } = this
    const useMiddleware = m => Array.isArray(m) ? app.use(m[0]/*path*/, m[1]/*handler*/) : app.use(m)
    this.preMiddlewares.forEach(useMiddleware)
    this.postMiddlewares.forEach(useMiddleware)
    this.initialized = true
  }
}
