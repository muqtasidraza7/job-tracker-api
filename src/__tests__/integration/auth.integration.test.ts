import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/db.js'

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: '@test-hawk.com' } } })
    await prisma.$disconnect()
})


describe("POST/api/auth/register", () => {
    it('returns 201 and a token on successful registration', async () => {
        const res = await request(app).post('/api/auth/register').send({ name: 'Test User', email: 'register@test-hawk.com', password: 'Password123!' })
        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.token).toBeDefined()
        expect(res.body.data.user.email).toBe('register@test-hawk.com')

    })

    it('returns 409 when email already exists', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'Dup', email: 'dup@test-hawk.com', password: 'Password123!'
        })
        const res = await request(app).post('/api/auth/register').send({
            name: 'Dup', email: 'dup@test-hawk.com', password: 'Password123!'
        })
        expect(res.status).toBe(409)
        expect(res.body.success).toBe(false)
    })
    it('returns 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Incomplete' })
        expect(res.status).toBe(400)
    })
    it('never returns the password in the response', async () => {
        const res = await request(app).post('/api/auth/register')
            .send({ name: 'Safe', email: 'safe@test-hawk.com', password: 'Password123!' })
        expect(res.body.data.user.password).toBeUndefined()
    })
})


describe('POST/api/auth/login', () => {
    beforeAll(async () => {
        await request(app).post('/api/auth/register')
            .send({ name: 'Login Test', email: 'login@test-hawk.com', password: 'Password123!' })
    })

    it('returns 200 and a token on valid credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'login@test-hawk.com', password: 'Password123!' })
        expect(res.status).toBe(200)
        expect(res.body.data.token).toBeDefined()
    })
    it('returns 401 for wrong password', async () => {
        const res = await request(app).post('/api/auth/login')
            .send({ email: 'login@test-hawk.com', password: 'WrongPassword!' })
        expect(res.status).toBe(401)
    })
    it('returns the same error for wrong email and wrong password', async () => {
        const wrongEmail = await request(app).post('/api/auth/login')
            .send({ email: 'nonexistent@test-hawk.com', password: 'Password123!' })
        const wrongPassword = await request(app).post('/api/auth/login')
            .send({ email: 'login@test-hawk.com', password: 'WrongPassword!' })
        expect(wrongEmail.body.error.message).toBe(wrongPassword.body.error.message)
    })
})
describe('GET /api/auth/me', () => {
    let token: string
    beforeAll(async () => {
        await request(app).post('/api/auth/register')
            .send({ name: 'Me Test', email: 'me@test-hawk.com', password: 'Password123!' })
        const login = await request(app).post('/api/auth/login')
            .send({ email: 'me@test-hawk.com', password: 'Password123!' })
        token = login.body.data.token
    })
    it('returns 401 with no token', async () => {
        const res = await request(app).get('/api/auth/me')
        expect(res.status).toBe(401)
    })
    it('returns user profile with valid token', async () => {
        const res = await request(app).get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.data.email).toBe('me@test-hawk.com')
        expect(res.body.data.password).toBeUndefined()
    })
})