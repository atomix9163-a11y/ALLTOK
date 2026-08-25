module.exports = {
    apps: [{
        name: 'mt-nicepay-api',
        script: 'bin/www',
        instances: 1,
        exec_mode: 'fork',
        listen_timeout: 50000,
        kill_timeout: 5000
    }]
}