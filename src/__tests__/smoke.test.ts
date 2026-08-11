describe('Jest is configured correctly', () => {
    it('can run a basic test', () => {
        expect(1 + 1).toBe(2)
    })

    it('TypeScript types work in tests', () => {
        const add = (a: number, b: number): number => a + b
        expect(add(3, 4)).toBe(7)
    })
})