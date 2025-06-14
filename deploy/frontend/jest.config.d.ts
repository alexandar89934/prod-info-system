declare const _default: {
    preset: string;
    testEnvironment: string;
    transform: {
        '^.+\\.tsx?$': string;
    };
    moduleNameMapper: {
        '\\.(gif|ttf|eot|svg|png)$': string;
        '^@/(.*)$': string;
    };
};
export default _default;
