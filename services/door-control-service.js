const logger = require('./logging-service')
const sleep = require('system-sleep')
const MyQ = require('myq-api');

const myqApi = new MyQ(process.env.MYQ_API_USERNAME, process.env.MYQ_API_PASSWORD);

const setGarageDoorState = async (doorName, open) => {
    let serviceResponse = '',
        success = false,
        attempts = 0,
        maxAttempts = 3

    while (!success && attempts < maxAttempts) {
        logger.info(`Logging in`)
        await myqApi.login()

        logger.info(`Looking for device ${doorName}`)
        let deviceList = await myqApi.getDevices(2)

        let state = open ? 1 : 0

        let selectedDevice
        if (deviceList) {
            deviceList.devices.forEach(device => {
                if (device.name.toLowerCase() == doorName.toLowerCase()) {
                    selectedDevice = device
                }
            })
        }

        if (selectedDevice) {
            logger.warn((open ? 'Opening' : 'Closing') + ` ${selectedDevice.name}...`)
            const response = await myqApi.setDoorState(selectedDevice.id, state)

            if (response.returnCode == 0) {
                serviceResponse = 'Command processed succesfully'
                logger.info(serviceResponse)
                success = true
            } else {
                serviceResponse = `Command failed: ${responseBody.ErrorMessage}`
                logger.error(serviceResponse)
            }
        } else {
            serviceResponse = 'Could not find device'
            logger.error(serviceResponse)
        }

        if (!success) {
            attempts++
            sleep(5000)
        }
    }

    return serviceResponse
}

module.exports = {
    setGarageDoorState
}