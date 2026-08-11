import type { Config } from 'jest'

const config: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\./|\\.\\./)(.+)\\.js$': '$1$2',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
}

export default config

