const storage = require("Storage").open("mood_log.json", "a");
require("Font8x16").add(Graphics);
// Constants for screen layout
const sliderMin = 1;
const sliderMax = 7;
let sliderValue = 4; // Default slider value
let currentQuestion = 0;

// when the drawing of the slider starts
// for both x and y
const sliderX1 = 10;
const sliderX2 = g.getWidth() - 10;
const sliderY = 90;
// for how much on top or bottom of the slider we can touch on
const sliderTolerance = 30;

let sensorDataIntervalRef = null;
let canAnswer = true;

// Questions array
const questions = [
	"How angry are you?",
	"How calm are you?",
	"How anxious are you?",
	"How focused are you?",
	"How tired are you?",
	"How happy are you?",
	"How stressed are you?",
];

// Labels for slider values
const sliderLabels = [
	"Not at all", // 1
	"Very little", // 2
	"Slightly", // 3
	"Moderate", // 4
	"Quite a bit", // 5
	"Very much", // 6
	"Extremely", // 7
];

// DRAW FUNCTIONS

function drawTitle() {
	g.setColor(0, 0, 0);
	//decimal values dont work for size

	g.setFont("8x16").setFontAlign(0, 0);
	g.drawString("How stressed are you?", g.getWidth() / 2, 30);
}

function drawButton() {
	g.setColor(0, 0, 1); // Blue
	g.fillRect(60, g.getHeight() - 35, g.getWidth() - 60, g.getHeight() - 5);
	g.setColor(1, 1, 1);
	g.drawString("OK", g.getWidth() / 2, g.getHeight() - 27);
}

function drawSlider() {
	// Slider bar
	const sliderPosition =
		sliderX1 +
		((sliderX2 - sliderX1) / (sliderMax - sliderMin)) *
			(sliderValue - sliderMin);

	g.setColor(0.5, 0.5, 0.5); // Gray
	g.fillRect(sliderX1, sliderY - 2, sliderX2, sliderY + 2);

	g.setColor(1, 0, 0); // Red
	g.fillCircle(sliderPosition, sliderY, 8);

	// Display labels for slider values
	const stepWidth = (sliderX2 - sliderX1) / (sliderMax - sliderMin);
	for (let i = sliderMin; i <= sliderMax; i++) {
		const labelX = sliderX1 + (i - sliderMin) * stepWidth;
		g.setFontAlign(0, -1); // Bottom-centered
		g.drawString(i, labelX, sliderY + 15); // Value numbers
	}
	// Display current value and message
	g.setColor(0, 0, 0);
	g.drawString(sliderLabels[sliderValue - 1], g.getWidth() / 2, sliderY - 35);
}

function drawFeedback(text) {
	g.clear();
	g.setFont("8x16").setFontAlign(0, 0);
	g.setColor(0, 0, 0);
	g.drawString(text, g.getWidth() / 2, g.getHeight() / 2);
	// Draw progress info
	const questionsLeft = questions.length - (currentQuestion + 1);
	const progressText = `Question ${currentQuestion + 1} of ${questions.length}`;
	g.setFont("8x16");
	g.drawString(progressText, g.getWidth() / 2, g.getHeight() / 2 + 20);
	g.flip();
}
function showWaitingScreen() {
	g.clear();
	g.setFont("8x16").setFontAlign(0, 0);
	g.setColor(0, 0, 0);

	// Get time until next quiz
	const now = Date.now();
	const nextQuizTime = Math.ceil(now / HOUR_MS) * HOUR_MS;
	const minutesUntilQuiz = Math.floor((nextQuizTime - now) / (60 * 1000));

	g.drawString("Next Quiz In:", g.getWidth() / 2, g.getHeight() / 2 - 30);
	g.drawString(
		`${minutesUntilQuiz} minutes`,
		g.getWidth() / 2,
		g.getHeight() / 2
	);
	g.flip();
}

function drawScreen() {
	g.clear();
	drawTitle();
	drawSlider();
	drawButton();
	g.flip();
}

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

// Modify the existing drawSlider function to be called from drag handler
function updateSliderValue(touchX) {
	const sliderX1 = 30;
	const sliderX2 = g.getWidth() - 30;

	if (touchX >= sliderX1 && touchX <= sliderX2) {
		sliderValue = Math.round(
			sliderMin +
				((touchX - sliderX1) / (sliderX2 - sliderX1)) * (sliderMax - sliderMin)
		);
		sliderValue = Math.min(sliderMax, Math.max(sliderMin, sliderValue));
		drawScreen();
	}
}

// Add these new event handlers
Bangle.on("drag", function (e) {
	// Check if touch is within slider area (with some padding)
	if (Math.abs(e.y - sliderY) < sliderTolerance) {
		updateSliderValue(e.x);
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

//SENSORS

function initializeSensors() {
	Bangle.setOptions({
		//hrmPollInterval: 3,
		powerSave: false,
	});
	Bangle.setBarometerPower(true);
	Bangle.setHRMPower(1);
	Bangle.setGPSPower(1);
}

function shutdownSensors() {
	Bangle.setHRMPower(0);
	Bangle.setGPSPower(0);
	Bangle.setBarometerPower(false);
	isCollectingData = false;
	if (sensorDataIntervalRef) {
		clearInterval(sensorDataIntervalRef);
		sensorDataIntervalRef = null;
	}
}

const dataPollingInterval = 1000 * 5;
// Data collection function
function collectSensorData() {
	// Save data point every 5 seconds
	if (isCollectingData) {
		sensorDataIntervalRef = setInterval(() => {
			sensorData.push(dataPoint);
		}, dataPollingInterval);
	}
}
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

// Add these constants at the top of the file
const HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const PRE_POST_QUIZ_DURATION = 10 * 60 * 1000; // 10 minutes

let sensorData = [];
let isCollectingData = false;
let quizInterval;

// Function to start the hourly cycle
function startHourlyCycle() {
	// Initial start
	scheduleNextQuiz();

	// Set up recurring hourly schedule
	quizInterval = setInterval(scheduleNextQuiz, HOUR_MS);
}

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

// Add cleanup function
function cleanup() {
	if (quizInterval) clearInterval(quizInterval);
	isCollectingData = false;
	Bangle.setHRMPower(0);
	Bangle.setGPSPower(0);
	Bangle.setBarometerPower(false);
}

export function updateLastQuizTime(storage) {
	// we are almost guaranteed that last_quiz_time.json exists

	const data = storage.writeJSON("last_quiz_time.json", {
		lastQuizTime: Date.now(),
	});
}
function checkIfHourHasPassed(storage) {
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

function startQuiz() {}

// MAIN
function init() {
	g.clear();
	Bangle.loadWidgets();
	Bangle.drawWidgets();
	initializeSensors();

	// // we check if an hour has Passed
	const { hourPassed, timeRemaining } = checkIfHourHasPassed(storage);
	if (hourPassed) {
		// we start the quiz
		// startHourlyCycle();

		initializeSensors();
		collectSensorData();
	} else {
		// we setup a timer to show the next quiz
		setTimeout(() => {
			// we start the cycle for the quiz here
		}, timeRemaining);
	}
}
