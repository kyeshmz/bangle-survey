g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

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

// Function to store data
function storeData(data) {
	const storage = require("Storage");
	const fileName = "gps_data.json";
	let existingData = storage.readJSON(fileName, 1) || [];
	existingData.push(data);
	storage.writeJSON(fileName, existingData);
}

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

	//GPS
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
	Bangle.setGPSPower(1);
	Bangle.on("GPS", (f) => {
		console.log(f);
	});

	// heartrate monitor
	Bangle.on("HRM", print);

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

		getGPSData(function (fix) {
			const data = {
				sliderValue: sliderValue,
				message: messages[sliderValue - 1],
				latitude: fix.lat,
				longitude: fix.lon,
				time: fix.time,
			};
			// Store the data (using a simple console log for demonstration)
			console.log("Storing data:", data);
			// You can replace this with actual storage code, e.g., using require("Storage").write(...)
		});
	}
}

// Main execution
Bangle.on("touch", handleTouch);
drawScreen();
