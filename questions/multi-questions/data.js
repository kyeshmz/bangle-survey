import { dataPollingInterval, storage } from "./constants";

export function saveAnswer(state) {
	const answer = {
		question: state.currentQuestion,
		value: state.sliderValue,
		timestamp: Date.now(),
	};
	state.answers.push(answer);
	console.log("state.answers", state.answers);
}

export function startDataCollection(state, stage, dataPoint) {
	if (stage === "pre") {
		state.dataIntervalRef = setInterval(() => {
			dataPoint.timestamp = Date.now();

			state.preQuiz.push(dataPoint);
		}, dataPollingInterval);
	} else if (stage === "during") {
		state.dataIntervalRef = setInterval(() => {
			dataPoint.timestamp = Date.now();

			state.duringQuiz.push(dataPoint);
		}, dataPollingInterval);
	} else if (stage === "post") {
		state.dataIntervalRef = setInterval(() => {
			dataPoint.timestamp = Date.now();

			state.postQuiz.push(dataPoint);
		}, dataPollingInterval);
	}
}

export function stopDataCollection(state) {
	clearInterval(state.dataIntervalRef);
	state.dataIntervalRef = null;
}
export function saveDataCollection(state, stage) {
	let existingData = {
		answers: [],
		preQuiz: [],
		duringQuiz: [],
		postQuiz: [],
		startTime: null,
		endTime: null,
	};
	try {
		existingData = storage.readJSON(`data_${state.startTime}.json`);
	} catch (e) {
		console.error("Error reading quiz data: ", e.message);
	}
	if (stage === "pre") {
		existingData.preQuiz.push(state.preQuiz);
	} else if (stage === "during") {
		existingData.duringQuiz.push(state.duringQuiz);
	} else if (stage === "post") {
		existingData.postQuiz.push(state.postQuiz);
	}

	storage.writeJSON(`data_${state.startTime}.json`, existingData);
}

export function createDataFile(state) {
	state.startTime = Date.now();
	storage.writeJSON(`data_${state.startTime}.json`, {
		answers: [],
		preQuiz: [],
		duringQuiz: [],
		postQuiz: [],
		startTime: state.startTime,
		endTime: null,
	});
}

export function saveStateData(state) {
	let existingData = {
		answers: [],
		preQuiz: [],
		duringQuiz: [],
		postQuiz: [],
		startTime: null,
		endTime: null,
	};

	try {
		existingData = storage.readJSON(`data_${state.startTime}.json`);
	} catch (e) {
		console.error("Error reading quiz data: ", e.message);
	}
	// console.log("SaveStateData state", state);

	existingData.answers.push(state.answers);
	existingData.preQuiz.push(state.preQuiz);
	existingData.duringQuiz.push(state.duringQuiz);
	existingData.postQuiz.push(state.postQuiz);

	console.log("existingData", existingData);

	storage.writeJSON(`data_${state.startTime}.json`, existingData);
}

function hashGPSCoordinate(coordinate, precision) {
	// Decimal places to distance conversion:
	// 0 decimal places = 111 km
	// 1 decimal place = 11.1 km
	// 2 decimal places (1.11 km) - Good for very privacy-sensitive data, tracking city-level movement
	// 2 decimal places = 1.11 km
	// 3 decimal places (111 m) - Good for general activity tracking while maintaining privacy
	// 3 decimal places = 111 m
	// 4 decimal places = 11.1 m
	// 5 decimal places = 1.11 m
	// 6 decimal places = 11.1 cm
	return (
		Math.round(coordinate * Math.pow(10, precision)) / Math.pow(10, precision)
	);
}

function hashLocation(lat, lon) {
	// Round latitude and longitude to 3 decimal places
	const latRounded = lat.toFixed(3);
	const lonRounded = lon.toFixed(3);

	// Combine the coordinates into a single string
	const combined = `${latRounded},${lonRounded}`;

	// Generate a hash (e.g., using SHA-256)
	const hash = crypto.subtle
		.digest("SHA-256", new TextEncoder().encode(combined))
		.then((buffer) => {
			// Convert the buffer to a hex string
			return Array.from(new Uint8Array(buffer))
				.map((byte) => byte.toString(16).padStart(2, "0"))
				.join("");
		});

	return hash;
}
