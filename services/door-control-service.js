const logger = require('./logging-service')
const sleep = require('system-sleep')
const MyQ = require('myq-api')

const myqApi = new MyQ()

const setGarageDoorState = async (doorName, open) => {
    let serviceResponse = '',
        success = false,
        attempts = 0,
        maxAttempts = 3

    while (!success && attempts < maxAttempts) {
        logger.info(`Logging in`)
        try {
            await myqApi.login(process.env.MYQ_API_USERNAME, process.env.MYQ_API_PASSWORD)
        } catch (error) {
            logger.error(error)
        }

        logger.info(`Looking for device ${doorName}`)
        let deviceList
        try {
            deviceList = await myqApi.getDevices()
            logger.info(JSON.stringify(deviceList))
        } catch (error) {
            logger.error(error)
        }

        let state = open ? MyQ.actions.door.OPEN : MyQ.actions.door.CLOSE

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
            try {
                await myqApi.setDoorState(selectedDevice.serial_number, state)
                serviceResponse = 'Command processed succesfully'
                success = true
            } catch (error) {
                logger.error(error)
                serviceResponse = `Command failed: ${setStateResult.message}`
            }
        } else {
            serviceResponse = 'Could not find device'
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