const { dataPollingInterval } = require("./constants");

export function initializeSensors(Bangle) {
	Bangle.setOptions({
		//hrmPollInterval: 3,
		powerSave: false,
	});
	Bangle.setBarometerPower(true);
	Bangle.setHRMPower(1);
	Bangle.setGPSPower(1);
}
export function shutdownSensors(Bangle) {
	Bangle.setHRMPower(0);
	Bangle.setGPSPower(0);
	Bangle.setBarometerPower(false);
	isCollectingData = false;
	if (sensorDataIntervalRef) {
		clearInterval(sensorDataIntervalRef);
		sensorDataIntervalRef = null;
	}
}

// Data collection function
export function collectSensorData(isCollectingData) {
	// Save data point every 5 seconds
	if (isCollectingData) {
		sensorDataIntervalRef = setInterval(() => {
			sensorData.push(dataPoint);
		}, dataPollingInterval);
	}
}
