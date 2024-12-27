module.exports = {
    apps: [{
        name: 'backend',
        script: 'nodemon',
        args: '--config nodemon.test.json ./src/index.ts',
        interpreter: 'none',
        watch: false,
    }],
};
