// Simple Heart Rate Monitor for BangleJS
// Shows current heart rate as text

let lastHeartRate = 0;

// Configure heart rate monitor
Bangle.setHRMPower(1);
Bangle.setOptions({
	hrmPollInterval: 3, // Poll every 3 seconds
	powerSave: false,
});

// Draw the heart rate display
function drawDisplay() {
	g.clear();

	// Draw title
	g.setFont("6x8", 2);
	g.setColor(0.5, 0.5, 0.5); // Gray

	g.setFontAlign(0, -1);
	g.drawString("Heart Rate", g.getWidth() / 2, 20);

	// Draw current BPM in large text
	g.setFont("6x8", 4);
	g.setFontAlign(0, 0);
	if (lastHeartRate === 0) {
		g.drawString("--", g.getWidth() / 2, g.getHeight() / 2);
	} else {
		g.drawString(lastHeartRate + " BPM", g.getWidth() / 2, g.getHeight() / 2);
	}

	// Draw exit instruction
	g.setFont("6x8", 1);
	g.setFontAlign(0, 1);
	g.drawString("BTN1: Exit", g.getWidth() / 2, g.getHeight() - 20);

	g.flip();
}

// Handle heart rate data
Bangle.on("HRM", function (hrm) {
	// console.log(hrm);
	if (hrm.confidence > 50) {
		lastHeartRate = hrm.bpm;
		drawDisplay();
	}
});

// Handle button press to exit
setWatch(
	() => {
		Bangle.setHRMPower(0);
		Bangle.showLauncher();
	},
	BTN1,
	{ repeat: false }
);

// Initial display
g.clear();
g.setFont("6x8", 2);
g.setColor("#FFFFFF");
g.setFontAlign(0, 0);
g.drawString("Starting HRM...", g.getWidth() / 2, g.getHeight() / 2);
g.flip();

// Keep LCD on
Bangle.setLCDPower(1);
