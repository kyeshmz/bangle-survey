const { HOUR_MS } = require("./constants");
// Function to check the current time and save it as the last quiz time
export function updateLastQuizTime(storage) {
	// we are almost guaranteed that last_quiz_time.json exists

	const data = storage.writeJSON("last_quiz_time.json", {
		lastQuizTime: Date.now(),
	});
}
export function checkIfHourHasPassed(storage) {
	const currentTime = Date.now();
	let lastQuizTime;
	try {
		const data = storage.readJSON("last_quiz_time.json");
		lastQuizTime = data.lastQuizTime;
	} catch (e) {
		console.error("Adding new time, Error reading last quiz time: ", e.message);
		const data = { lastQuizTime: Date.now() };
		storage.write("last_quiz_time.json", JSON.stringify(data));
		lastQuizTime = Date.now();
	}
	const timeElapsed = currentTime - data.lastQuizTime;
	const hourPassed = Number(timeElapsed) > HOUR_MS;
	const timeRemaining = HOUR_MS - (timeElapsed % HOUR_MS);

	return { hourPassed, timeRemaining };
}
