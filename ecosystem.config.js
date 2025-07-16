module.exports = {
  apps: [
    {
      name: 'aliwebb',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://aliuser:alipass@localhost:5432/aliexpress',
        JWT_SECRET: 'supersecretkey123'
      }
    }
  ]
}