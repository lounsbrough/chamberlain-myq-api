const request = require('async-request')
const sleep = require('system-sleep')

const logger = require('./logging-service')

let SecurityToken

const sendLoginRequest = async () => {
    const options = {
        method: 'POST',
        headers:
            {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded',
                myqapplicationid: process.env.MYQ_API_APPLICATION_ID,
                culture: 'en',
                apiversion: '4.1',
                brandid: '2',
                'user-agent': 'Chamberlain/3.73'
            },
        data:
            {
                username: process.env.MYQ_API_USERNAME,
                password: process.env.MYQ_API_PASSWORD
            }
    }

    logger.info('Attempting to login...')
    const response = await request('https://myqexternal.myqdevice.com/api/v4/User/Validate', options)

    let responseBody = JSON.parse(response.body)
    if (responseBody.SecurityToken && responseBody.ErrorMessage == '') {
        SecurityToken = responseBody.SecurityToken
        logger.info(`Logged in successfully`)
        logger.info(`Security Token: ${SecurityToken}`)
    } else {
        logger.error(`Login failed: ${responseBody.ErrorMessage}`)
    }
}

const retrieveDeviceList = async () => {
    let deviceList = []

    if (SecurityToken) {

        const options = {
            method: 'GET',
            headers:
                {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded',
                    myqapplicationid: process.env.MYQ_API_APPLICATION_ID,
                    securitytoken: SecurityToken
                }
        }

        logger.info('Retrieving device list...')
        const response = await request('https://myqexternal.myqdevice.com/api/v4/userdevicedetails/get', options)

        let responseBody = JSON.parse(response.body)
        if (responseBody.ErrorMessage == '' && responseBody.Devices) {
            logger.info('Device list retrieved successfully')

            responseBody.Devices.forEach(device => {
                let deviceObject = {
                    id: device.MyQDeviceId,
                    type: device.MyQDeviceTypeName,
                    description: ''
                }
                device.Attributes.forEach(attribute => {
                    if (attribute.AttributeDisplayName == 'desc') {
                        deviceObject.description = attribute.Value
                    }
                })
                deviceList.push(deviceObject)
            })

        } else {
            logger.error(`Command failed: ${responseBody.ErrorMessage}`)
        }

        return deviceList

    }
}

const setGarageDoorState = async (doorName, open) => {
    let serviceResponse = '',
        success = false,
        attempts = 0,
        maxAttempts = 2

    while (!success && attempts <= maxAttempts) {
        await sendLoginRequest()

        let deviceList = await retrieveDeviceList()

        let state = (open ? 1 : 0)

        let selectedDevice
        if (deviceList) {
            deviceList.forEach(device => {
                if (device.description.toLowerCase() == doorName.toLowerCase()) {
                    selectedDevice = device
                }
            })
        }

        if (selectedDevice) {

            logger.warn((open ? 'Opening' : 'Closing') + ` ${selectedDevice.description}...`)

            const options = {
                method: 'PUT',
                headers:
                    {
                        'cache-control': 'no-cache',
                        'content-type': 'application/x-www-form-urlencoded',
                        myqapplicationid: process.env.MYQ_API_APPLICATION_ID,
                        securitytoken: SecurityToken
                    },
                data:
                    {
                        MyQDeviceId: selectedDevice.id,
                        AttributeName: 'desireddoorstate',
                        AttributeValue: state,
                        appId: process.env.MYQ_API_APPLICATION_ID
                    }
            }

            const response = await request('https://myqexternal.myqdevice.com/api/v4/deviceattribute/putdeviceattribute', options)

            let responseBody = JSON.parse(response.body)
            if (responseBody.ErrorMessage == '') {
                serviceResponse = 'Command processed succesfully'
                logger.info(serviceResponse)
                success = true
            } else {
                serviceResponse = `Command failed: ${responseBody.ErrorMessage}`
                logger.error(serviceResponse)
            }
        }
        else {
            serviceResponse = 'Could not find device'
            logger.error(serviceResponse)
        }

        attempts++
        sleep(5000)
    }

    return serviceResponse
}

module.exports = {
    setGarageDoorState
}