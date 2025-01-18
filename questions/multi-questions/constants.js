const storage = require("Storage").open("mood_log.json", "a");
require("Font8x16").add(Graphics);
// Constants for screen layout
export const sliderMin = 1;
export const sliderMax = 7;

// when the drawing of the slider starts
// for both x and y
export const sliderX1 = 10;
export const sliderX2 = g.getWidth() - 10;
export const sliderY = 90;
// for how much on top or bottom of the slider we can touch on
export const sliderTolerance = 30;

export const dataPollingInterval = 1000 * 5;

// Questions array
export const questions = [
	"How angry are you?",
	"How calm are you?",
	"How anxious are you?",
	"How focused are you?",
	"How tired are you?",
	"How happy are you?",
	"How stressed are you?",
];

// Labels for slider values
export const sliderLabels = [
	"Not at all", // 1
	"Very little", // 2
	"Slightly", // 3
	"Moderate", // 4
	"Quite a bit", // 5
	"Very much", // 6
	"Extremely", // 7
];

// Add these constants at the top of the file
export const HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
export const PRE_POST_QUIZ_DURATION = 10 * 60 * 1000; // 10 minutes
