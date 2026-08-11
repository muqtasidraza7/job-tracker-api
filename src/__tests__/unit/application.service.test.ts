import { jest, describe, it, expect, beforeEach } from "@jest/globals"

await jest.unstable_mockModule('../../config/db.js', () => ({
    prisma: {
        application: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    }
}))

const { getApplicationById, updateApplication } = await import("../../services/application.service.js")
const { prisma } = await import('../../config/db.js')

const mockFindUnique = prisma.application.findUnique as jest.MockedFunction<typeof prisma.application.findUnique>
const mockUpdate = prisma.application.update as jest.MockedFunction<typeof prisma.application.update>

describe('application.service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('get application by id', () => {
        it('returns the application when it belongs to the requesting user', async () => {
            const mockApplication = {
                id: 1, authorId: 42, companyName: 'Arbisoft', position: 'Backend Engineer',
                jobUrl: null, status: 'APPLIED', minSalary: null, maxSalary: null,
                location: null, notes: null, appliedAt: null, createdAt: new Date(), updatedAt: new Date()
            }
            mockFindUnique.mockResolvedValue(mockApplication as any)
            const result = await getApplicationById(1, 42)
            expect(result.data).toEqual(mockApplication)
            expect(result.status).toBeUndefined()
            expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 1 } })
        })

        it('returns 404 when the application does not exist', async () => {
            mockFindUnique.mockResolvedValue(null)
            const result = await getApplicationById(999, 42)
            expect(result.status).toBe(404)
            expect(result.data).toBeUndefined()
        })

        it('returns 403 when the application belongs to a different user', async () => {
            const mockApp = { id: 1, authorId: 99 }
            mockFindUnique.mockResolvedValue(mockApp as any)
            const result = await getApplicationById(1, 42)
            expect(result.status).toBe(403)
            expect(result.data).toBeUndefined()
        })
    })

    describe('updateApplication', () => {
        it('updates and returns the application for the correct owner', async () => {
            const existing = { id: 1, authorId: 42 }
            const updated = {
                id: 1, authorId: 42, companyName: 'Devsinc',
                position: 'Senior Backend', jobUrl: null, status: 'APPLIED',
                minSalary: null, maxSalary: null, location: null,
                notes: null, appliedAt: null, createdAt: new Date(), updatedAt: new Date()
            }
            mockFindUnique.mockResolvedValue(existing as any)
            mockUpdate.mockResolvedValue(updated as any)
            const result = await updateApplication(1, 42, { companyName: 'Devsinc' })
            expect(result.data).toEqual(updated)
            expect(result.status).toBeUndefined()
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { companyName: 'Devsinc' }
            })
        })
        it('returns 403 when a different user tries to update', async () => {
            const existing = { id: 1, authorId: 99 }
            mockFindUnique.mockResolvedValue(existing as any)
            const result = await updateApplication(1, 42, { companyName: 'Other' })
            expect(result.status).toBe(403)
            expect(mockUpdate).not.toHaveBeenCalled()
        })
    })
})


