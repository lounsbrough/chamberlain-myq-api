const express = require('express')
const url = require('url')

let app = express()
const port = 7237

app.get('/', async (req, res) => {
    let garageDoorService = require('./services/door-control-service')
    let queryData = url.parse(req.url, true).query
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    if (queryData.password && queryData.password == process.env.HTTPS_AUTHENTICATION_SECRET) {
        if (queryData.door && queryData.state) {
            let response = await garageDoorService.setGarageDoorState(queryData.door, (queryData.state.toLowerCase() == 'open' ? true : false))
            res.write(response)
        }
    }
    res.end()
})

app.listen(port, function () {
    console.log(`app listening on port ${port}`)
})