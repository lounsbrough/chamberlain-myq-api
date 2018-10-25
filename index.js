const express = require('express')

const logger = require('./services/logging-service')

let app = express()
const port = 7237

app.use(express.json())

app.post('/', async (req, res) => {
    let garageDoorService = require('./services/door-control-service')
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    if (req.body.authCode && req.body.authCode == process.env.HTTPS_AUTHENTICATION_SECRET) {
        if (req.body.door && req.body.action) {
            let response = await garageDoorService.setGarageDoorState(req.body.door, (req.body.action.toLowerCase() == 'open' ? true : false))
            res.write(response)
        }
    }
    res.end()
})

app.listen(port, function () {
    logger.info(`app listening on port ${port}`)
})