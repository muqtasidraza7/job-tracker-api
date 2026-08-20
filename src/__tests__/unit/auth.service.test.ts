import { jest, describe, it, expect, beforeEach } from "@jest/globals"

await jest.unstable_mockModule('../../config/db.js', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    }
}))

const { findUserByEmail, createUser } = await import("../../services/auth.service.js")
const { prisma } = await import('../../config/db.js')

const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>
const mockCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>

describe('auth.service', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('findUserByEmail', () => {
        it('returns a user when the email exists in the database', async () => {
            const mockUser = {
                id: 1,
                name: 'Hawk',
                email: 'hawk@test.com',
                password: 'hashed_password',
                avatarUrl: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            mockFindUnique.mockResolvedValue(mockUser)
            const result = await findUserByEmail('hawk@test.com')
            expect(result).toEqual(mockUser)
            expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'hawk@test.com' } })
            expect(mockFindUnique).toHaveBeenCalledTimes(1)
        })

        it('return null when the email does not exist', async () => {
            mockFindUnique.mockResolvedValue(null)
            const result = await findUserByEmail('ghost@gmail.com')
            expect(result).toBeNull()
            expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'ghost@gmail.com' } })
            expect(mockFindUnique).toHaveBeenCalledTimes(1)
        })
    })

    describe('create user', () => {
        it('creates a user when input is provided', async () => {
            const mockInput = { name: 'Hawk', email: 'hawk@test.com', password: 'hashed_pw' }
            const mockCreated = {
                id: 1,
                ...mockInput,
                avatarUrl: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            mockCreate.mockResolvedValue(mockCreated)
            const result = await createUser(mockInput)
            expect(result).toEqual(mockCreated)
            expect(mockCreate).toHaveBeenCalledWith({ data: mockInput })
            expect(mockCreate).toHaveBeenCalledTimes(1)

        })


    })

})
