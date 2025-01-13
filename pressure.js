// Pressure and Temperature Monitor for BangleJS
// Shows current barometric pressure and temperature readings

let pressure = 0;
let temperature = 0;
Bangle.setBarometerPower(true);
Bangle.setOptions({
	powerSave: false,
});

// Configure pressure sensor

// Draw the display
function drawDisplay() {
	g.clear();

	// Draw title
	g.setFont("6x8", 2);
	g.setFontAlign(0, -1);
	g.drawString("Pressure & Temp", g.getWidth() / 2, 20);

	// Draw pressure reading
	g.setFont("6x8", 3);
	g.setFontAlign(0, 0);
	g.drawString(
		pressure.toFixed(1) + " hPa",
		g.getWidth() / 2,
		g.getHeight() / 2 - 20
	);

	// Draw temperature reading
	g.setFont("6x8", 3);
	g.drawString(
		temperature.toFixed(1) + "°C",
		g.getWidth() / 2,
		g.getHeight() / 2 + 20
	);

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
