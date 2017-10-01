//process file for pm2 instancing testing
module.exports = {
    apps: [{
        name:       "CasinoBot",
        script:     "./CasinoBot.js",
        instances:  2,
        exec_mode:  "cluster"
    }]
}
