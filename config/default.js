/**
 * Created by admin on 25.06.2016.
 */
'use strict';
import {CONSTS} from './consts';
// import defer from 'config/defer';

import path from 'path';

const config = {
  consts: CONSTS,
  host: {
    ip: 'localhost',
    port: 3000,
  },
  crypto: {
    hash: {
      length: 128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: process.env.NODE_ENV == process.env.OPENSHIFT_ENV_VAR
        ? 12000
        : 1,
    }
  },
  keys: ['mysecret'],
  mongoose: {
    uri: (process.env.MONGODB_URL || '127.0.0.1/') + 'gift',
    options: {
      server: {
        socketOptions: {
          keepAlive: 1
        },
        poolSize: 5,
      },
      db: {
        nativeParser: true
      },
    },
  },

  projectRoot: process.cwd(),
}
export { config }