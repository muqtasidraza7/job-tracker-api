import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { NotFoundError, ForbiddenError } from "../../utils/errors.js"

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
            expect(result).toEqual(mockApplication)
            expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 1 } })
        })

        it('throws NotFoundError when the application does not exist', async () => {
            mockFindUnique.mockResolvedValue(null)
            await expect(getApplicationById(999, 42)).rejects.toThrow(NotFoundError)
        })

        it('throws ForbiddenError when the application belongs to a different user', async () => {
            const mockApp = { id: 1, authorId: 99 }
            mockFindUnique.mockResolvedValue(mockApp as any)
            await expect(getApplicationById(1, 42)).rejects.toThrow(ForbiddenError)
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
            expect(result).toEqual(updated)
            expect(mockUpdate).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { companyName: 'Devsinc' }
            })
        })
        it('throws ForbiddenError when a different user tries to update', async () => {
            const existing = { id: 1, authorId: 99 }
            mockFindUnique.mockResolvedValue(existing as any)
            await expect(updateApplication(1, 42, { companyName: 'Other' })).rejects.toThrow(ForbiddenError)
            expect(mockUpdate).not.toHaveBeenCalled()
        })
    })
})



