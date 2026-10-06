import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/db.js'

let tokenA: string
let tokenB: string
let appIdA: number

beforeAll(async () => {
    await request(app).post('/api/auth/register')
        .send({ name: 'User A', email: 'usera@test-hawk.com', password: 'Password123!' })
    const loginA = await request(app).post('/api/auth/login')
        .send({ email: 'usera@test-hawk.com', password: 'Password123!' })
    tokenA = loginA.body.data.token

    await request(app).post('/api/auth/register')
        .send({ name: 'User B', email: 'userb@test-hawk.com', password: 'Password123!' })
    const loginB = await request(app).post('/api/auth/login')
        .send({ email: 'userb@test-hawk.com', password: 'Password123!' })
    tokenB = loginB.body.data.token

    const appRes = await request(app).post('/api/applications')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ companyName: 'Arbisoft', position: 'Backend Engineer' })
    appIdA = appRes.body.data.id
})

afterAll(async () => {
    await prisma.application.deleteMany({
        where: { author: { email: { contains: '@test-hawk.com' } } }
    })
    await prisma.user.deleteMany({ where: { email: { contains: '@test-hawk.com' } } })
    await prisma.$disconnect()
})

describe('Application ownership enforcement', () => {

    it('User A can read their own application', async () => {
        const res = await request(app)
            .get(`/api/applications/${appIdA}`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(res.status).toBe(200)
        expect(res.body.data.companyName).toBe('Arbisoft')
    })

    it('User B cannot read User A application — returns 403', async () => {
        const res = await request(app)
            .get(`/api/applications/${appIdA}`)
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(403)
        expect(res.body.data).toBeUndefined()
    })

    it('User B cannot update User A application — returns 403', async () => {
        const res = await request(app)
            .patch(`/api/applications/${appIdA}`)
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ companyName: 'Hacked' })

        expect(res.status).toBe(403)
    })

    it('User B cannot delete User A application — returns 403', async () => {
        const res = await request(app)
            .delete(`/api/applications/${appIdA}`)
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(403)
    })

    it('GET /api/applications only returns the logged-in user\'s applications', async () => {
        const res = await request(app)
            .get('/api/applications')
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(0)
        expect(res.body.meta.total).toBe(0)
    })
})


describe('Stage creation transaction', () => {

    it('automatically sets application status to INTERVIEWING on first stage', async () => {
        const appRes = await request(app).post('/api/applications')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ companyName: 'Devsinc', position: 'Node Engineer', status: 'APPLIED' })
        const testAppId = appRes.body.data.id

        await request(app).post(`/api/applications/${testAppId}/stages`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ type: 'PHONE_SCREEN' })

        const appAfter = await request(app)
            .get(`/api/applications/${testAppId}`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(appAfter.body.data.status).toBe('INTERVIEWING')
    })

    it('does not change status again on second stage', async () => {
        const appRes = await request(app).post('/api/applications')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ companyName: 'Folio3', position: 'Junior Dev', status: 'APPLIED' })
        const testAppId = appRes.body.data.id

        await request(app).post(`/api/applications/${testAppId}/stages`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ type: 'PHONE_SCREEN' })

        await request(app).patch(`/api/applications/${testAppId}/status`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ status: 'OFFERED' })

        await request(app).post(`/api/applications/${testAppId}/stages`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ type: 'TECHNICAL' })

        const appAfter = await request(app)
            .get(`/api/applications/${testAppId}`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(appAfter.body.data.status).toBe('OFFERED')
    })
})
