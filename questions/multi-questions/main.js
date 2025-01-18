import { drawScreen } from "./draw";
import { collectSensorData, initializeSensors } from "./sensors";
const storage = require("Storage").open("mood_log.json", "a");
require("Font8x16").add(Graphics);

let sliderValue = 4; // Default slider value
let currentQuestion = 0;

let sensorDataIntervalRef = null;
let canAnswer = true;

function saveAnswer() {
	let answer = {
		question: questions[currentQuestion],
		value: sliderValue,
		timestamp: Date.now(),
	};
	storage.write(JSON.stringify(answer) + "\n");
}

function nextQuestion() {
	canAnswer = false;
	saveAnswer();

	if (currentQuestion < questions.length - 1) {
		drawFeedback("Answer Recorded!");
		setTimeout(() => {
			currentQuestion++;
			sliderValue = 4; // Reset slider
			drawScreen();
			canAnswer = true;
		}, 1000);
	} else {
		drawFeedback("Survey Complete!");
		stopDataCollection("post-quiz");
		setTimeout(() => {
			showWaitingScreen();
		}, 2000);
	}
}

//SENSORS

function cancelSensorData() {
	sensorDataIntervalRef.clearInterval();
}

let dataPoint = {
	timestamp: Date.now(),
	HRMheartRate: 0,
	HRMconfidence: 0,
	HRMfilt: 0,
	HRMraw: 0,
	pressure: 0,
	temperature: 0,
	altitude: 0,
	acceleration: { x: 0, y: 0, z: 0 },
	gps: { fix: 0, lat: 0, lon: 0 },
};

// Set up sensor event listeners
Bangle.on("HRM-raw", function (hrm) {
	dataPoint.HRMheartRate = hrm.bpm;
	dataPoint.HRMconfidence = hrm.confidence;
	dataPoint.HRMfilt = hrm.filt;
	dataPoint.HRMraw = hrm.raw;
});

Bangle.on("pressure", function (e) {
	dataPoint.pressure = e.pressure;
	dataPoint.temperature = e.temperature;
	dataPoint.altitude = e.altitude;
});

Bangle.on("accel", function (acc) {
	dataPoint.acceleration = {
		x: acc.x,
		y: acc.y,
		z: acc.z,
	};
});

Bangle.on("GPS", function (gps) {
	dataPoint.gps = {
		fix: gps.fix,
		lat: gps.lat,
		lon: gps.lon,
	};
});

// Add these new event handlers
Bangle.on("drag", function (e) {
	// Check if touch is within slider area (with some padding)
	if (Math.abs(e.y - sliderY) < sliderTolerance) {
		const sliderX1 = 30;
		const sliderX2 = g.getWidth() - 30;
		const touchX = e.x;

		if (touchX >= sliderX1 && touchX <= sliderX2) {
			sliderValue = Math.round(
				sliderMin +
					((touchX - sliderX1) / (sliderX2 - sliderX1)) *
						(sliderMax - sliderMin)
			);
			sliderValue = Math.min(sliderMax, Math.max(sliderMin, sliderValue));
			drawScreen();
		}
	}
});

// Main execution
Bangle.on("touch", function (zone, e) {
	const touchX = e.x || 0;
	const touchY = e.y || 0;

	if (
		touchY > sliderY - sliderTolerance &&
		touchY < sliderY + sliderTolerance
	) {
		if (touchX >= sliderX1 && touchX <= sliderX2) {
			sliderValue = Math.round(
				sliderMin +
					((touchX - sliderX1) / (sliderX2 - sliderX1)) *
						(sliderMax - sliderMin)
			);
			sliderValue = Math.min(sliderMax, Math.max(sliderMin, sliderValue));
			drawScreen();
		}
	}

	// OK button touch detection
	if (
		touchY > g.getHeight() - 50 &&
		touchY < g.getHeight() - 10 &&
		touchX > 60 &&
		touchX < g.getWidth() - 60 &&
		canAnswer
	) {
		Bangle.buzz(100);
		nextQuestion();
	}
});

let sensorData = [];
let isCollectingData = false;
let quizInterval;

// Function to schedule the next quiz
function scheduleNextQuiz() {
	// Start sensor collection 10 minutes before quiz
	setTimeout(() => {
		isCollectingData = true;
		initializeSensors();
		collectSensorData();

		drawFeedback("Pre-quiz sensor\ndata collection\nstarted");

		// Start quiz after 10 minutes of data collection
		setTimeout(() => {
			stopDataCollection("pre-quiz");
			startQuiz();

			// Start post-quiz collection when quiz ends
			setTimeout(() => {
				isCollectingData = true;
				collectSensorData();

				// Stop post-quiz collection after 10 minutes
				setTimeout(() => {
					stopDataCollection("post-quiz");
					showWaitingScreen();
				}, PRE_POST_QUIZ_DURATION);
			}, estimateQuizDuration());
		}, PRE_POST_QUIZ_DURATION);
	}, HOUR_MS - PRE_POST_QUIZ_DURATION);
}

// Modify the existing stopDataCollection function
function stopDataCollection(phase) {
	isCollectingData = false;
	const storage = require("Storage");

	let filename = `sensor_data_${phase}_${Date.now()}.json`;
	storage.write(
		filename,
		JSON.stringify({
			phase: phase,
			timestamp: Date.now(),
			data: sensorData,
		})
	);

	sensorData = []; // Clear the array for next collection
}

// Function to start the hourly cycle
function startHourlyCycle() {
	// Initial start
	scheduleNextQuiz();
	// Set up recurring hourly schedule
	quizInterval = setInterval(scheduleNextQuiz, HOUR_MS);
}

// MAIN
function init() {
	g.clear();
	Bangle.loadWidgets();
	Bangle.drawWidgets();
	drawFeedback("Starting Pre-Quiz\nData Collection...");
	initializeSensors(Bangle);

	// // we check if an hour has Passed
	// const { hourPassed, timeRemaining } = checkIfHourHasPassed(storage);
	// if (hourPassed) {
	// 	// we start the quiz
	// 	startHourlyCycle();
	// } else {
	// 	// we setup a timer to show the next quiz
	// 	setTimeout(() => {
	// 		// we start the cycle for the quiz here
	// 	}, timeRemaining);
	// }

	// startHourlyCycle();
}

init();
