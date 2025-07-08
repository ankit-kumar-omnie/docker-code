module.exports = {
  apps: [
    {
      name: "app",
      script: "./src/main.ts",
      interpreter: "node",
      interpreter_args: "-r ts-node/register -r tsconfig-paths/register",
      watch: ["src"],
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "development"
      },
      watch_options: {
        usePolling: true,
        interval: 1000
      }
    }
  ]
};
