// shows all the sensors needed for experiment

// for global
Bangle.setOptions({
	hrmPollInterval: 3, // Poll every 3 seconds
	powerSave: false,
});

let pressure = 0;
let temperature = 0;
let lastHeartRate = 0;
let lastAcceleration = { x: 0, y: 0, z: 0 };
let lastGPS = {
	fix: 0,
	lat: 0,
	lon: 0,
};

//for pressure
Bangle.setBarometerPower(true);
Bangle.setHRMPower(1);
Bangle.setGPSPower(1);

// Configure pressure sensor

// Draw the display
function drawDisplay() {
	g.clear();

	// Draw title
	g.setFont("6x8", 1.3);
	g.setFontAlign(0, -1);
	g.drawString("All sensors", g.getWidth() / 2, 20);

	// Draw pressure reading
	g.setFont("6x8", 1);
	g.setFontAlign(0, 0);
	g.drawString(
		pressure.toFixed(1) + " hPa " + temperature.toFixed(1) + "°C",
		g.getWidth() / 2,
		g.getHeight() / 2 - 20
	);

	g.setFont("6x8", 1);
	g.drawString(
		lastHeartRate + " BPM",
		g.getWidth() / 2,
		g.getHeight() / 2 + 40
	);

	g.setFont("6x8", 1);
	g.drawString(
		"X: " +
			lastAcceleration.x.toFixed(2) +
			"Y: " +
			lastAcceleration.y.toFixed(2) +
			"Z: " +
			lastAcceleration.z.toFixed(2),
		g.getWidth() / 2,
		g.getHeight() / 2 + 10
	);

	if (lastGPS.fix) {
		g.drawString(
			"Lat: " + lastGPS.lat.toFixed(6) + "Lon: " + lastGPS.lon.toFixed,
			g.getWidth() / 2,
			g.getHeight() / 2 + 20
		);
	}

	// Draw exit instruction
	g.setFont("6x8", 1);
	g.setFontAlign(0, 1);
	g.drawString("BTN1: Exit", g.getWidth() / 2, g.getHeight() - 20);

	g.flip();
}

//Bangle.getPressure().then(d=>{
//  console.log(d);
// {temperature, pressure, altitude}
//});

// Handle pressure readings
Bangle.on("pressure", function (e) {
	// console.log(e);

	pressure = e.pressure;
	temperature = e.temperature;
	drawDisplay();
});

Bangle.on("HRM", function (hrm) {
	// console.log(hrm);
	if (hrm.confidence > 50) {
		lastHeartRate = hrm.bpm;
		drawDisplay();
	}
});

Bangle.on("accel", function (acc) {
	lastAcceleration = acc;
});

Bangle.on("GPS", function (gps) {
	//console.log(gps);
	lastGPS.lat = gps.lat;
	lastGPS.lon = gps.lon;
	lastGPS.fix = gps.fix;
	lastGPS = gps;
	drawDisplay();
});

// Handle button press to exit
setWatch(
	() => {
		Bangle.showLauncher();
	},
	BTN1,
	{ repeat: false }
);

// Initial display
g.clear();
g.setFont("6x8", 2);
g.setFontAlign(0, 0);
g.drawString("Starting sensor...", g.getWidth() / 2, g.getHeight() / 2);
g.flip();

// Keep LCD on
Bangle.setLCDPower(1);
