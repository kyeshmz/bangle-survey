// const { sliderMax } = require("./constants");
import { sliderMax } from "./constants";

var on = false;
setInterval(function () {
	on = !on;
	console.log(sliderMax);
	digitalWrite(LED1, on);
}, 500);
