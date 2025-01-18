import { questions } from "./constants";
import { drawFeedback, drawScreen } from "./draw";

export function nextQuestion(state) {
	state.canAnswer = false;

	if (state.currentQuestion < questions.length - 1) {
		drawFeedback("Answer Recorded!", state.currentQuestion);
		setTimeout(() => {
			state.currentQuestion = state.currentQuestion + 1;
			state.sliderValue = 4; // Reset slider
			drawScreen(state.sliderValue);
			state.canAnswer = true;
		}, 1000);
		return false;
	} else {
		drawFeedback("Survey Complete!", state.currentQuestion);
		return true;
	}
}
