const winston = require('winston')
const fs = require('fs')

const logDir = 'log'

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}
const tsFormat = () => (new Date()).toLocaleString()

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'verbose'
        }),
        new (require('winston-daily-rotate-file'))({
            filename: `${logDir}/-results.log`,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: 'verbose',
            maxDays: 30
        })
    ]
})

module.exports = logger;