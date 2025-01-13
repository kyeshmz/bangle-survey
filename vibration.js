// Button Vibration App for BangleJS
// Vibrates the watch when button is pressed

// Display initial instructions
function drawDisplay() {
	g.clear();

	// Draw title
	g.setFont("6x8", 2);
	g.setColor("#FFFFFF");
	g.setFontAlign(0, -1);
	g.drawString("Vibration Test", g.getWidth() / 2, 20);

	// Draw instructions
	g.setFont("6x8", 2);
	g.setFontAlign(0, 0);
	g.drawString(
		"BTN1: Short Vibration",
		g.getWidth() / 2,
		g.getHeight() / 2 - 20
	);
	g.drawString(
		"BTN2: Long Vibration",
		g.getWidth() / 2,
		g.getHeight() / 2 + 20
	);

	// Draw exit instruction
	g.setFont("6x8", 1);
	g.setFontAlign(0, 1);
	g.drawString("BTN3: Exit", g.getWidth() / 2, g.getHeight() - 20);

	g.flip();
}

// Handle BTN1 press - Short vibration
setWatch(
	() => {
		// Vibrate for 200ms
		Bangle.buzz(200);

		// Optional: Flash screen to show button press
		g.setColor("#FFFF00");
		g.fillRect(0, 0, g.getWidth(), g.getHeight());
		g.flip();

		// Redraw display after a short delay
		setTimeout(drawDisplay, 250);
	},
	BTN1,
	{ repeat: true, edge: "rising" }
);

// Handle BTN2 press - Long vibration
setWatch(
	() => {
		// Vibrate for 500ms
		Bangle.buzz(500);

		// Optional: Flash screen to show button press
		g.setColor("#FFFF00");
		g.fillRect(0, 0, g.getWidth(), g.getHeight());
		g.flip();

		// Redraw display after a short delay
		setTimeout(drawDisplay, 550);
	},
	BTN2,
	{ repeat: true, edge: "rising" }
);

// Handle BTN3 press - Exit app
setWatch(
	() => {
		Bangle.showLauncher();
	},
	BTN3,
	{ repeat: false, edge: "rising" }
);

// Initial display setup
g.clear();
drawDisplay();

// Keep LCD on
Bangle.setLCDPower(1);
