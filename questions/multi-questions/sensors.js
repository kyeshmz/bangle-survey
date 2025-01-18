export function initializeSensors(Bangle) {
	Bangle.setOptions({
		//hrmPollInterval: 3,
		powerSave: false,
	});
	Bangle.setBarometerPower(true);
	Bangle.setHRMPower(1);
	Bangle.setGPSPower(1);
}
export function shutdownSensors(Bangle, state) {
	Bangle.setHRMPower(0);
	Bangle.setGPSPower(0);
	Bangle.setBarometerPower(false);
	if (state.dataIntervalRef) {
		clearInterval(state.dataIntervalRef);
		state.dataIntervalRef = null;
	}
}
