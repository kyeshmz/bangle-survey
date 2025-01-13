// Accelerometer Display for BangleJS
// Shows real-time X, Y, Z acceleration values

Bangle.on("accel", function (acc) {
	// Clear the display
	g.clear();

	// Set font and color
	g.setFont("6x8", 2);
	g.setColor(g.theme.fg);

	// Draw title
	g.drawString("Accelerometer", 10, 10);

	// Draw separator line
	g.drawLine(0, 30, g.getWidth(), 30);

	// Display acceleration values
	g.setFont("6x8", 3);

	// X acceleration
	g.setColor("#FF0000");
	g.drawString("X: " + acc.x.toFixed(2), 10, 50);

	// Y acceleration
	g.setColor("#00FF00");
	g.drawString("Y: " + acc.y.toFixed(2), 10, 90);

	// Z acceleration
	g.setColor("#0000FF");
	g.drawString("Z: " + acc.z.toFixed(2), 10, 130);

	// Draw a simple visualization
	const centerX = g.getWidth() - 40;
	const centerY = 100;
	const scale = 20; // Scale factor for visualization

	g.setColor("#FFFFFF");
	g.drawCircle(centerX, centerY, 30);

	// Draw dot representing current acceleration
	g.setColor("#FF0000");
	g.fillCircle(centerX + acc.x * scale, centerY + acc.y * scale, 5);

	// Force screen update
	g.flip();
});

// Handle button press to exit
setWatch(
	() => {
		Bangle.showLauncher();
	},
	BTN1,
	{ repeat: false }
);

// Show initial screen
g.clear();
g.setFont("6x8", 2);
g.setColor(g.theme.fg);
g.drawString("Starting...", 10, 10);
g.flip();

// Keep LCD on
Bangle.setLCDPower(1);
