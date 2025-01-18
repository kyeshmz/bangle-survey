import {
	sliderMax,
	sliderMin,
	sliderTolerance,
	sliderX1,
	sliderX2,
	sliderY,
} from "./constants";
import {
	createDataFile,
	saveAnswer,
	saveDataCollection,
	saveStateData,
	startDataCollection,
	stopDataCollection,
} from "./data";
import { drawScreen } from "./draw";
import { nextQuestion } from "./questions";
import { initializeSensors } from "./sensors";
import { checkIfHourHasPassed, updateLastQuizTime } from "./time";

require("Font8x16").add(Graphics);

let state = {
	currentQuestion: 0,
	sliderValue: 4,
	canAnswer: true,
	//answers look like
	//  {
	// 	question: state.currentQuestion,
	// 	value: state.sliderValue,
	// 	timestamp: Date.now(),
	// };
	answers: [],
	preQuiz: [],
	duringQuiz: [],
	postQuiz: [],
	dataIntervalRef: null,
	startTime: Date.now(),
	endTime: null,
};

function resetState() {
	state.currentQuestion = 0;
	state.sliderValue = 4;
	state.canAnswer = true;
	state.answers = [];
	state.preQuiz = [];
	state.duringQuiz = [];
	state.postQuiz = [];
	state.dataIntervalRef = null;
	state.startTime = null;
	state.endTime = null;
}

//SENSORS

let dataPoint = {
	timestamp: null,
	HRMheartRate: 0,
	HRMconfidence: 0,
	HRMfilt: 0,
	HRMraw: 0,
	pressure: 0,
	temperature: 0,
	altitude: 0,
	acceleration: { x: 0, y: 0, z: 0 },
	gps: { lat: 0, lon: 0 },
	gpsHash: null,
	isInside: 0,
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

// { "lat": number,      // Latitude in degrees
// 	"lon": number,      // Longitude in degrees
// 	"alt": number,      // altitude in M
// 	"speed": number,    // Speed in kph
// 	"course": number,   // Course in degrees
// 	"time": Date,       // Current Time (or undefined if not known)
// 	"satellites": 7,    // Number of satellites
// 	"fix": 1            // NMEA Fix state - 0 is no fix
// 	"hdop": number,     // Horizontal Dilution of Precision
//   }
Bangle.on("GPS", function (gps) {
	dataPoint.gps = {
		lat: gps.lat,
		lon: gps.lon,
	};
	dataPoint.gpsHash = hashLocation(gps.lat, gps.lon);
	dataPoint.isInside = gps.fix;
});

// handles both the touch through e.b and the drag through e.x and e.y

Bangle.on("drag", function (e) {
	const hasBeenTouched = e.b === 1;
	const touchX = e.x || 0;
	const touchY = e.y || 0;

	if (
		hasBeenTouched &&
		touchY > sliderY - sliderTolerance &&
		touchY < sliderY + sliderTolerance
	) {
		if (touchX >= sliderX1 && touchX <= sliderX2) {
			state.sliderValue = Math.round(
				sliderMin +
					((touchX - sliderX1) / (sliderX2 - sliderX1)) *
						(sliderMax - sliderMin)
			);
			state.sliderValue = Math.min(
				sliderMax,
				Math.max(sliderMin, state.sliderValue)
			);
			drawScreen(state.sliderValue);
		}
	}

	// OK button touch detection
	if (
		hasBeenTouched &&
		touchY > g.getHeight() - 50 &&
		touchY < g.getHeight() - 10 &&
		touchX > 60 &&
		touchX < g.getWidth() - 60 &&
		state.canAnswer
	) {
		console.log("okay button has been pressed");
		Bangle.buzz(100);

		// save the answer
		saveAnswer(state);
		saveStateData(state);
		//go to next question
		const isDone = nextQuestion(state);
		if (isDone) {
			stopQuiz();
		}
	}
});

// Function to schedule the next quiz
// function scheduleNextQuiz() {
// 	// Start sensor collection 10 minutes before quiz
// 	setTimeout(() => {
// 		isCollectingData = true;
// 		initializeSensors();
// 		collectSensorData();

// 		drawFeedback("Pre-quiz sensor\ndata collection\nstarted");

// 		// Start quiz after 10 minutes of data collection
// 		setTimeout(() => {
// 			stopDataCollection("pre-quiz");
// 			startQuiz();

// 			// Start post-quiz collection when quiz ends
// 			setTimeout(() => {
// 				isCollectingData = true;
// 				collectSensorData();

// 				// Stop post-quiz collection after 10 minutes
// 				setTimeout(() => {
// 					stopDataCollection("post-quiz");
// 					showWaitingScreen();
// 				}, PRE_POST_QUIZ_DURATION);
// 			}, estimateQuizDuration());
// 		}, PRE_POST_QUIZ_DURATION);
// 	}, HOUR_MS - PRE_POST_QUIZ_DURATION);
// }

// Function to start the hourly cycle
// function startHourlyCycle() {
// 	// Initial start
// 	scheduleNextQuiz();
// 	// Set up recurring hourly schedule
// 	quizInterval = setInterval(scheduleNextQuiz, HOUR_MS);
// }

function startQuiz() {
	state.startTime = Date.now();
	startDataCollection(state, "during", dataPoint);
	createDataFile(state);
	drawScreen(state.sliderValue);
}

function stopQuiz() {
	state.endTime = Date.now();
	// we start the post data collection

	startDataCollection(state, "post", dataPoint);
	setTimeout(() => {
		saveDataCollection(stage, "post");
		stopDataCollection(state);
	}, 1000 * 60 * 10);
	updateLastQuizTime(state);
	// resetState();
	scheduleNextQuiz();
}

function scheduleNextQuiz() {
	setTimeout(() => {
		startDataCollection(state, "pre", dataPoint);
	}, 1000 * 60 * 50);

	setTimeout(() => {
		startQuiz();
	}, 1000 * 60 * 60);
}

// MAIN
function init() {
	g.clear();
	Bangle.loadWidgets();
	Bangle.drawWidgets();

	initializeSensors(Bangle);

	// // we check if an hour has Passed
	const hourPassedResult = checkIfHourHasPassed();

	console.log("hour passed", hourPassedResult.hourPassed);
	console.log("time remaining", hourPassedResult.timeRemaining);
	startQuiz();
	// if (hourPassedResult.hourPassed) {
	// 	// we start the quiz
	// 	startQuiz();
	// } else {
	// 	// we setup a timer to show the next quiz
	// 	setTimeout(() => {
	// 		startDataCollection(state, "pre", dataPoint);
	// 	}, hourPassedResult.timeRemaining - 10);

	// 	setTimeout(() => {
	// 		startQuiz();
	// 	}, hourPassedResult.timeRemaining);
	// }
}

init();
