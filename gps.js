// GPS Display for BangleJS
// Shows current GPS coordinates and related info

let fix = {
	fix: 0,
	lat: 0,
	lon: 0,
	alt: 0,
	speed: 0,
	satellites: 0,
};

// Configure GPS
Bangle.setGPSPower(1);

// Draw the display
function drawDisplay() {
	g.clear();

	// Draw title
	g.setFont("6x8", 2);
	g.setColor("#FFFFFF");
	g.setFontAlign(0, -1);
	g.drawString("GPS Status", g.getWidth() / 2, 10);

	// Set font for readings
	g.setFont("6x8", 2);
	g.setFontAlign(-1, -1);

	// Draw GPS fix status
	g.setColor(fix.fix ? "#00FF00" : "#FF0000");
	g.drawString("Fix: " + (fix.fix ? "YES" : "NO"), 10, 40);

	// Draw number of satellites
	g.setColor("#FFFFFF");
	g.drawString("Satellites: " + fix.satellites, 10, 70);

	// Draw coordinates if we have a fix
	if (fix.fix) {
		g.drawString("Lat: " + fix.lat.toFixed(6), 10, 100);
		g.drawString("Lon: " + fix.lon.toFixed(6), 10, 130);
		g.drawString("Alt: " + fix.alt.toFixed(1) + "m", 10, 160);
		g.drawString("Speed: " + (fix.speed * 3.6).toFixed(1) + "km/h", 10, 190);
	} else {
		g.setColor("#888888");
		g.drawString("Waiting for GPS...", 10, 100);
	}

	// Draw exit instruction
	g.setColor("#FFFFFF");
	g.setFont("6x8", 1);
	g.setFontAlign(0, 1);
	g.drawString("BTN1: Exit", g.getWidth() / 2, g.getHeight() - 10);

	g.flip();
}

// Handle GPS data
Bangle.on("GPS", function (gps) {
	console.log(gps);
	fix = gps;
	drawDisplay();
});

// Handle button press to exit
setWatch(
	() => {
		Bangle.setGPSPower(0);
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
g.drawString("Starting GPS...", g.getWidth() / 2, g.getHeight() / 2);
g.flip();

// Keep LCD on
Bangle.setLCDPower(1);
