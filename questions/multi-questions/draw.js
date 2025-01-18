import {
	HOUR_MS,
	questions,
	sliderLabels,
	sliderMax,
	sliderMin,
	sliderX1,
	sliderX2,
	sliderY,
} from "./constants";

export function drawTitle() {
	g.setColor(0, 0, 0);
	//decimal values dont work for size

	g.setFont("8x16").setFontAlign(0, 0);
	g.drawString("How stressed are you?", g.getWidth() / 2, 30);
}

export function drawButton() {
	g.setColor(0, 0, 1); // Blue
	g.fillRect(60, g.getHeight() - 35, g.getWidth() - 60, g.getHeight() - 5);
	g.setColor(1, 1, 1);
	g.drawString("OK", g.getWidth() / 2, g.getHeight() - 27);
}

export function drawSlider(sliderValue) {
	// Slider bar
	const sliderPosition =
		sliderX1 +
		((sliderX2 - sliderX1) / (sliderMax - sliderMin)) *
			(sliderValue - sliderMin);

	g.setColor(0.5, 0.5, 0.5); // Gray
	g.fillRect(sliderX1, sliderY - 2, sliderX2, sliderY + 2);

	g.setColor(1, 0, 0); // Red
	g.fillCircle(sliderPosition, sliderY, 8);

	// Display labels for slider values
	const stepWidth = (sliderX2 - sliderX1) / (sliderMax - sliderMin);
	for (let i = sliderMin; i <= sliderMax; i++) {
		const labelX = sliderX1 + (i - sliderMin) * stepWidth;
		g.setFontAlign(0, -1); // Bottom-centered
		g.drawString(i, labelX, sliderY + 15); // Value numbers
	}
	// Display current value and message
	g.setColor(0, 0, 0);
	g.drawString(sliderLabels[sliderValue - 1], g.getWidth() / 2, sliderY - 35);
}

export function drawFeedback(text, currentQuestion) {
	g.clear();
	g.setFont("8x16").setFontAlign(0, 0).setColor(0, 0, 0);
	g.drawString(text, g.getWidth() / 2, g.getHeight() / 2);
	// Draw progress info
	const questionsLeft = questions.length - currentQuestion - 1;
	const progressText = `Remaining ${questionsLeft} of ${questions.length}`;
	if (currentQuestion != 0) {
		g.setFont("8x16");
		g.drawString(progressText, g.getWidth() / 2, g.getHeight() / 2 + 20);
	}
	g.flip();
}
export function drawWaitingScreen() {
	g.clear();
	g.setFont("8x16").setFontAlign(0, 0);
	g.setColor(0, 0, 0);

	// Get time until next quiz
	const now = Date.now();
	const nextQuizTime = Math.ceil(now / HOUR_MS) * HOUR_MS;
	const minutesUntilQuiz = Math.floor((nextQuizTime - now) / (60 * 1000));

	g.drawString("Next Quiz In:", g.getWidth() / 2, g.getHeight() / 2 - 30);
	g.drawString(
		`${minutesUntilQuiz} minutes`,
		g.getWidth() / 2,
		g.getHeight() / 2
	);
	g.flip();
}

export function drawScreen(sliderValue) {
	g.clear();
	drawTitle();
	drawSlider(sliderValue);
	drawButton();
	g.flip();
}

// Modify the existing drawSlider function to be called from drag handler
function updateSliderValue(touchX) {
	const sliderX1 = 30;
	const sliderX2 = g.getWidth() - 30;

	if (touchX >= sliderX1 && touchX <= sliderX2) {
		sliderValue = Math.round(
			sliderMin +
				((touchX - sliderX1) / (sliderX2 - sliderX1)) * (sliderMax - sliderMin)
		);
		sliderValue = Math.min(sliderMax, Math.max(sliderMin, sliderValue));
		drawScreen();
	}
}
