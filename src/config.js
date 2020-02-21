module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/pood',
    TEST_DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/pood-test',
    JWT_SECRET: process.env.JWT_SECRET || 'godooers',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
  }