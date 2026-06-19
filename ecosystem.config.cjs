const path = require("path");

const nodeInterpreter =
  process.env.NODE_BIN || "/root/.nvm/versions/node/v24.16.0/bin/node";

/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "finances",
      cwd: __dirname,
      script: path.join(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -p 3000",
      interpreter: nodeInterpreter,
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,
      error_file: path.join(__dirname, "logs/pm2-error.log"),
      out_file: path.join(__dirname, "logs/pm2-out.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
