import { HOUR_MS, lastQuizTimeName, storage } from "./constants";

// Function to check the current time and save it as the last quiz time
export function updateLastQuizTime(state) {
	storage.writeJSON(lastQuizTimeName, {
		lastQuizTime: state.endTime,
	});
}
export function checkIfHourHasPassed() {
	const currentTime = Date.now();
	let lastQuizTime;
	try {
		const data = storage.readJSON(lastQuizTimeName);
		lastQuizTime = data.lastQuizTime;
	} catch (e) {
		console.error("Adding new time, Error reading last quiz time: ", e.message);
		const data = { lastQuizTime: Date.now() };
		storage.writeJSON(lastQuizTimeName, data);
		lastQuizTime = Date.now();
	}
	const timeElapsed = currentTime - lastQuizTime;
	const hourPassed = Number(timeElapsed) > HOUR_MS;
	const timeRemaining = HOUR_MS - (timeElapsed % HOUR_MS);

	return { hourPassed, timeRemaining };
}
