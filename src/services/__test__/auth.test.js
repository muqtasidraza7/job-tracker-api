import { findUserByEmail, createUser, findUserById } from "../auth.service.js";
import { prisma } from "../../config/db.js";


jest.mock("../../config/db.js", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));

describe("Auth Service Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findUserByEmail", () => {
        it("should return a user when email exists", async () => {
            const mockUser = { id: 1, name: "Lahore Coder", email: "test@example.com" };

            prisma.user.findUnique.mockResolvedValue(mockUser);


            const result = await findUserByEmail("test@example.com");

            expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
            expect(result).toEqual(mockUser);
        });

        it("should return null if user email does not exist", async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await findUserByEmail("notfound@example.com");

            expect(result).toBeNull();
        });
    });

    describe("createUser", () => {
        it("should create a new user and return it", async () => {
            const fakeData = {
                name: "Muqtasid",
                email: "test@gmail.com",
                password: "password123"
            };

            const mockCreatedUser = {
                id: 1,
                ...fakeData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            prisma.user.create.mockResolvedValue(mockCreatedUser);


            const result = await createUser(fakeData);


            expect(prisma.user.create).toHaveBeenCalledTimes(1);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: fakeData
            });
            expect(result).toEqual(mockCreatedUser);
        });
    });

});
