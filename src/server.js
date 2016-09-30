'use strict';

// if (!process.env.TRACE) {
//   require('./server/libs/trace');
// }

import Koa from 'koa';
import fs from 'fs';
import middlewares from './core/middlewares';
import api from './core/api';
import routes from './routes';
import { config } from 'config';

import { connectDatabase } from './core/libs/mongoose';
import { renderToString } from 'react-dom/server'
import { ServerRouter, createServerRenderContext } from 'react-router'
import { join } from 'path';

import App from './client';

import React from 'react';


(async() => {
  await connectDatabase()
})();
const app = new Koa();
app.keys = config.keys;
app.use(middlewares());
console.log('qwe');

let handlers = fs.readdirSync(join(__dirname, 'core/handlers'));
handlers.forEach(handler => {
  app.use(require('./core/handlers/' + handler)[handler]())
});

app.use(async(ctx, next) => {

  const context = createServerRenderContext()

  // render the first time
  //   console.log(ctx.url)
  //   <App/>
  console.log(context);
  let markup = renderToString(
    <ServerRouter location={ctx.url} context={context}>
      <App />
    </ServerRouter>
  );

  const result = context.getResult();

  // the result will tell you if it redirected, if so, we ignore
  // the markup and send a proper redirect.
  if (result.redirect) {
    // res.writeHead(301, {
    //   Location: result.redirect.pathname
    // })

    ctx.redirect(result.redirect.pathname)
    await next();
    // res.end()
  } else {

    // the result will tell you if there were any misses, if so
    // we can send a 404 and then do a second render pass with
    // the context to clue the <Miss> components into rendering
    // this time (on the client they know from componentDidMount)
    if (result.missed) {
      markup = renderToString(
        <ServerRouter
          location={ctx.url}
          context={context}
        >
        <App />
        </ServerRouter>
      )
    }
    console.log(markup);
    ctx.body = markup;
    // res.write(markup)
    // res.end()
  }
  await next();






  //   let location = createLocation(ctx.req.url);

  //   match({ routes, location }, (error, redirectLocation, renderProps) => {
  //     console.log('location:', location);


  //     if (redirectLocation) {
  //       console.log('redirectLocation:', redirectLocation);
  //       ctx.redirect(redirectLocation.pathname + redirectLocation.search)
  //     } else if (error) {
  //       console.log('error:', error);
  //       ctx.throw(500, error.message)
  //     } else if (renderProps == null) {
  //       ctx.throw(404, 'Not Found')
  //     } else {
  //       // set proper HTTP code for if matched route wasn't found
  //       // console.log('renderProps:', renderProps);

  //       // if (renderProps.components.indexOf(NotFound) != -1) {
  //       //     ctx.status = 404
  //       // }
  //       ctx.response.body = renderToString(<RouterContext {...renderProps}/>)

  //     }
  //   })
  //   await next();
})

app.use(api());
app.listen({...config.host },
  () => console.log('Server in running at %s:%d', config.host.ip, config.host.port));