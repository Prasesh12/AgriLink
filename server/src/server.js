const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`AgriLink server listening on port ${env.port} [${env.nodeEnv}]`);
});
