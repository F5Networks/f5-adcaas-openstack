/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');
const application = require('./dist');

module.exports = application;

if (require.main === module) {
  // Run the application
  let config = {
    rest: {
      port: +process.env.WAF_APP_PORT || 3000,
      host: process.env.WAF_APP_HOST || '0.0.0.0',
      protocol: 'http',
      openApiSpec: {
        // useful when used with OASGraph to locate your application
        setServersFromRequest: true,
      },
    },
  };

  if (process.env.WAF_ENABLE_HTTPS === 'true') {
    config.rest['protocol'] = 'https';

    if (!process.env.WAF_CERT_KEY) {
      console.error('WAF_CERT_KEY is not configred');
      process.exit(1);
    }

    config.rest['key'] = fs.readFileSync(process.env.WAF_CERT_KEY);

    if (!process.env.WAF_CERT_CRT) {
      console.error('WAF_CERT_CRT is not configred');
      process.exit(1);
    }

    config.rest['cert'] = fs.readFileSync(process.env.WAF_CERT_CRT);
  }

  application.main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
