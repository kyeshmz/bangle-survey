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

function initializeSensors() {
	Bangle.setOptions({
		hrmPollInterval: 3,
		powerSave: false,
	});
	Bangle.setBarometerPower(true);
	Bangle.setHRMPower(1);
	Bangle.setGPSPower(1);
}

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

function drawFeedback(text) {
	g.clear();
	g.setFont("6x8", 2);
	g.setFontAlign(0, 0);
	g.drawString(text, g.getWidth() / 2, g.getHeight() / 2);
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
	saveAnswer();

	if (currentQuestion < questions.length - 1) {
		drawFeedback("Answer Recorded!");
		setTimeout(() => {
			currentQuestion++;
			sliderValue = 4; // Reset slider
			drawScreen();
		}, 1000);
	} else {
		drawFeedback("Survey Complete!");
	}
}

function drawScreen() {
	g.clear();
	drawTitle();
	drawSlider();
	drawButton();
	g.flip();
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

function init() {
	g.clear();
	Bangle.loadWidgets();
	Bangle.drawWidgets();
	drawFeedback("Starting Pre-Quiz\nData Collection...");
	initializeSensors();
}

// Main execution
Bangle.on("touch", handleTouch);

init();
drawScreen();
