g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

//https://www.espruino.com/Bangle.js+Storage
//https://www.espruino.com/Data+Collection
const storage = require("Storage").open("log.json", "a");

// Constants for screen layout
const sliderMin = 1;
const sliderMax = 7;
let sliderValue = 4; // Default slider value

// Messages for each slider value
const messages = [
	"Very Calm", // 1
	"Calm", // 2
	"Slightly Annoyed", // 3
	"Neutral", // 4
	"Irritated", // 5
	"Angry", // 6
	"Furious", // 7
];

function drawTitle() {
	const sliderY = 90;

	g.setColor(0, 0, 0);
	// Display current value and message
	g.setFont("6x8", 1).setFontAlign(0, 0); // Centered font
	g.drawString("How Angry Are You?", g.getWidth() / 2, 30); // Question remains at the top
}

function drawButton() {
	// OK Button
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
	g.drawString(messages[sliderValue - 1], g.getWidth() / 2, sliderY + 60);
}

function drawScreen() {
	g.clear();

	drawTitle();
	drawSlider();

	drawButton();
}

function handleTouch(zone, e) {
	const touchX = e.x || 0; // Fallback if `e.x` isn't available
	const touchY = e.y || 0;

	// Check if user clicked on slider
	const sliderY = 90;
	const sliderX1 = 30;
	const sliderX2 = g.getWidth() - 30;

	if (touchY > sliderY - 20 && touchY < sliderY + 20) {
		if (touchX >= sliderX1 && touchX <= sliderX2) {
			sliderValue = Math.round(
				sliderMin +
					((touchX - sliderX1) / (sliderX2 - sliderX1)) *
						(sliderMax - sliderMin)
			);
			sliderValue = Math.min(sliderMax, Math.max(sliderMin, sliderValue)); // Clamp value
		}
	}
	drawScreen();

	// Check if user clicked on OK button
	const buttonY1 = g.getHeight() - 50;
	const buttonY2 = g.getHeight() - 10;

	if (
		touchX > 60 &&
		touchX < g.getWidth() - 60 &&
		touchY > buttonY1 &&
		touchY < buttonY2
	) {
		console.log(
			"Selected Value: " + sliderValue + " - " + messages[sliderValue - 1]
		);
		Bangle.buzz(); // Provide feedback
	}
}

Bangle.setHRMPower(1);
Bangle.on("HRM", function (hrm) {
	/*hrm is an object containing:
    { "bpm": number,             // Beats per minute
      "confidence": number,      // 0-100 percentage confidence in the heart rate
      "raw": Uint8Array,         // raw samples from heart rate monitor
   */

	const data = {
		bpm: hrm.bpm,
		confidence: hrm.confidence,
		raw: Array.from(hrm.raw),
		timestamp: Date.now(),
	};

	// Attempt to read existing data from storage
	let allData = [];
	const existingData = require("Storage").read("heartRateData.json");
	if (existingData) {
		try {
			allData = JSON.parse(existingData); // Parse existing JSON array
		} catch (e) {
			console.log("Failed to parse existing data. Starting fresh.");
		}
	}

	// Append new data
	allData.push(newData);

	// Save updated data back to storage
	require("Storage").write("heartRateData.json", JSON.stringify(allData));

	// Debug log (optional)
	console.log("Heart Rate Data Saved:", data);
});

Bangle.on("accel", function (acc) {
	// acc = {x,y,z,diff,mag}
});

// Main execution
Bangle.on("touch", handleTouch);
drawScreen();
