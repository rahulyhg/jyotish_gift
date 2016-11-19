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
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { ServerRouter, createServerRenderContext } from 'react-router'
import { join } from 'path';
import React from 'react';
import App from './app';

(async() => {
  await connectDatabase()
})();
const app = new Koa();
app.keys = config.keys;
app.use(middlewares());

let handlers = fs.readdirSync(join(__dirname, 'core/handlers'));
handlers.forEach(handler => {
  app.use(require('./core/handlers/' + handler)[handler]())
});

app.use(async(ctx, next) => {
  
  const context = createServerRenderContext();
  let htmlMarkup = (content) => `<html>
  <head></head>
  <body class="xxx">
  <div id="app">${content}</div>  
  <script src="vendor-min.js"></script>
  <script src="app.js"></script>
  </body>
  </html>
`;
  // render the first time
  let markup = renderToString(
       <ServerRouter location={ctx.url} context={context}>
          <App />
        </ServerRouter>
  );
  
  const result = context.getResult();
  
  // the result will tell you if it redirected, if so, we ignore
  // the markup and send a proper redirect.
  if ( result.redirect ) {
    ctx.redirect(result.redirect.pathname);
    await next();
  } else {
    
    // the result will tell you if there were any misses, if so
    // we can send a 404 and then do a second render pass with
    // the context to clue the <Miss> components into rendering
    // this time (on the client they know from componentDidMount)
    if ( result.missed ) {
      markup = renderToString(
          <body className="test">
          <ServerRouter location={ctx.url} context={context}>
            <App />
          </ServerRouter>
          </body>
      )
    }
    
    ctx.body = htmlMarkup(markup);
  }
  await next();
});

app.use(api());
app.listen({...config.host}, () => console.log('Server in running at %s:%d', config.host.ip, config.host.port));