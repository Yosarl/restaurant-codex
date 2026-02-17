module.exports = {
  apps: [
    {
      name: 'restaurant-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
