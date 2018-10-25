const { createLogger, format, transports } = require('winston')
const { combine, timestamp, simple } = format
require('winston-daily-rotate-file')
const fs = require('fs')

const loggingDirectory = 'logs'

if (!fs.existsSync(loggingDirectory)) {
    fs.mkdirSync(loggingDirectory)
}

const rotatingLogFile = new (transports.DailyRotateFile)({
    filename: 'logs-%DATE%.log',
    dirname: loggingDirectory,
    datePattern: 'YYYY-MM-DD',
    maxSize: '100m',
    maxFiles: '30d'
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        simple()
    ),
    transports: [
        new transports.Console(),
        rotatingLogFile
    ]
});

module.exports = logger;