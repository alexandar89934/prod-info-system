module.exports = {
    apps: [
        {
            name: 'backend',
            script: 'node',
            args: './dist/src/index.js',
            instances: 1,
            watch: false,
            env: {
                NODE_ENV: "production"
            }
        }
    ],
};
