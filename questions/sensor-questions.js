g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

const storage = require("Storage").open("mood_log.json", "a");

// Constants for screen layout
const sliderMin = 1;
const sliderMax = 7;
let sliderValue = 4; // Default slider value
let currentQuestion = 0;

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

let sensorData = [];
let quizStartTime = 0;
let isCollectingData = false;
const COLLECTION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

const questionData = [];

function drawTitle() {
	g.setColor(0, 0, 0);
	g.setFont("6x8", 1).setFontAlign(0, 0);
	g.drawString(questions[currentQuestion], g.getWidth() / 2, 30);
}

function drawButton() {
	g.setColor(0, 0, 1); // Blue
	g.fillRect(60, g.getHeight() - 50, g.getWidth() - 60, g.getHeight() - 10);
	g.setColor(1, 1, 1);
	g.drawString("OK", g.getWidth() / 2, g.getHeight() - 30);
}

function drawSlider() {
	// Slider bar
	const sliderY = 90;
	const sliderX1 = 30;
	const sliderX2 = g.getWidth() - 30;
	const sliderPosition =
		sliderX1 +
		((sliderX2 - sliderX1) / (sliderMax - sliderMin)) *
			(sliderValue - sliderMin);

	g.setColor(0.5, 0.5, 0.5); // Gray
	g.fillRect(sliderX1, sliderY - 2, sliderX2, sliderY + 2);

	g.setColor(1, 0, 0); // Red
	g.fillCircle(sliderPosition, sliderY, 10);

	// Display labels for slider values
	const stepWidth = (sliderX2 - sliderX1) / (sliderMax - sliderMin);
	for (let i = sliderMin; i <= sliderMax; i++) {
		const labelX = sliderX1 + (i - sliderMin) * stepWidth;
		g.setFontAlign(0, -1); // Bottom-centered
		g.drawString(i, labelX, sliderY + 15); // Value numbers
	}
	// Display current value and message
	g.setColor(1, 1, 1);
	g.drawString("Value: " + sliderValue, g.getWidth() / 2, sliderY + 30);
	g.drawString(sliderLabels[sliderValue - 1], g.getWidth() / 2, sliderY + 60);
}

function drawScreen() {
	g.clear();
	drawTitle();
	drawSlider();
	drawButton();
	g.flip();
}

// Initialize all sensors
function initializeSensors() {
	Bangle.setOptions({
		hrmPollInterval: 3,
		powerSave: false,
	});
	Bangle.setBarometerPower(true);
	Bangle.setHRMPower(1);
	Bangle.setGPSPower(1);
}

// Data collection function
function collectSensorData() {
	let dataPoint = {
		timestamp: Date.now(),
		heartRate: 0,
		pressure: 0,
		temperature: 0,
		acceleration: { x: 0, y: 0, z: 0 },
		gps: { fix: 0, lat: 0, lon: 0 },
	};

	// Set up sensor event listeners
	Bangle.on("HRM", function (hrm) {
		if (hrm.confidence > 50) {
			dataPoint.heartRate = hrm.bpm;
		}
	});

	Bangle.on("pressure", function (e) {
		dataPoint.pressure = e.pressure;
		dataPoint.temperature = e.temperature;
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

	// Save data point every 5 seconds
	return setInterval(() => {
		if (isCollectingData) {
			sensorData.push({ ...dataPoint });
		}
	}, 5000);
}

// Start data collection
function startDataCollection() {
	isCollectingData = true;
	initializeSensors();
	return collectSensorData();
}

// Stop data collection and save data
function stopDataCollection(phase) {
	isCollectingData = false;
	const storage = require("Storage");

	let filename = `sensor_data_${phase}_${Date.now()}.json`;
	storage.write(
		filename,
		JSON.stringify({
			phase: phase,
			quizStartTime: quizStartTime,
			data: sensorData,
		})
	);

	sensorData = []; // Clear the array
}

function drawFeedback(text) {
	g.clear();
	g.setColor(1, 1, 1);
	g.setFont("6x8", 2);
	g.setFontAlign(0, 0);

	// Handle multiline text
	const lines = text.split("\n");
	const lineHeight = 30;
	const startY = g.getHeight() / 2 - ((lines.length - 1) * lineHeight) / 2;

	lines.forEach((line, i) => {
		g.drawString(line, g.getWidth() / 2, startY + i * lineHeight);
	});

	g.flip();

	// Auto clear if duration specified

	setTimeout(() => {
		drawScreen();
	}, 2000);
}

// Modify the existing quiz functions
function startQuiz() {
	quizStartTime = Date.now();
	currentQuestion = 0;
	sliderValue = 4;

	// Stop pre-quiz collection and start the quiz
	setTimeout(() => {
		stopDataCollection("pre-quiz");
		drawScreen();

		// Start post-quiz collection when quiz ends
		setTimeout(() => {
			startDataCollection();
			setTimeout(() => {
				stopDataCollection("post-quiz");
			}, COLLECTION_DURATION);
		}, questions.length * 2000); // Estimated quiz duration
	}, COLLECTION_DURATION);
}

function nextQuestion() {
	// Save current question data
	questionData.push({
		questionId: currentQuestion,
		question: questions[currentQuestion],
		answer: sliderValue,
		timestamp: Date.now(),
	});

	// Move to next question or end survey
	if (currentQuestion < questions.length - 1) {
		drawFeedback("Answer Recorded!");
		setTimeout(() => {
			currentQuestion++;
			sliderValue = 4; // Reset slider
			drawScreen();
		}, 1000);
	} else {
		// End of survey
		const storage = require("Storage");
		storage.write("survey_responses.json", JSON.stringify(questionData));

		drawFeedback("Survey Complete!");
		setTimeout(() => {
			Bangle.showLauncher();
		}, 2000);
	}
}

// Add button handler
function handleButton() {
	if (
		touchY > g.getHeight() - 50 &&
		touchY < g.getHeight() - 10 &&
		touchX > 60 &&
		touchX < g.getWidth() - 60
	) {
		Bangle.buzz();
		nextQuestion();
	}
}

function handleTouch(zone, e) {
	const touchX = e.x || 0;
	const touchY = e.y || 0;

	// Slider touch detection
	const sliderY = 90;
	const sliderX1 = 30;
	const sliderX2 = g.getWidth() - 30;

	if (touchY > sliderY - 40 && touchY < sliderY + 40) {
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
		touchX < g.getWidth() - 60
	) {
		Bangle.buzz(100);
		nextQuestion();
	}
}

// Initialize app
Bangle.on("touch", handleTouch);

// Initialize the app
function init() {
	g.clear();
	Bangle.loadWidgets();
	Bangle.drawWidgets();

	drawFeedback("Starting Pre-Quiz\nData Collection...");

	// Start pre-quiz data collection
	startDataCollection();

	// Start the quiz after 10 minutes
	setTimeout(startQuiz, COLLECTION_DURATION);
}

// Start the app
init();
