import dotenv from 'dotenv'
dotenv.config()

process.env.JWT_KEY = 'test_secret_key_for_jest'
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test'
process.env.JWT_EXPIRES_IN = '1d'


