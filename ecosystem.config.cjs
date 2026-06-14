/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "finances",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
