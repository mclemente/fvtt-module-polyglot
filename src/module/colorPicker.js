// Color Picker by kaelad02
// License: MIT
// Documentation: https://github.com/kaelad02/adv-reminder/blob/54207ec1ef0500439e57521f15956c07e4c02af4/src/settings.js#L91-L104

export function colorPicker(settingId, html, settingValue) {
	const colorPickerElement = document.createElement("input");
	colorPickerElement.setAttribute("type", "color");
	colorPickerElement.setAttribute("data-edit", settingId);
	colorPickerElement.value = settingValue;

	// Add color picker
	const stringInputElement = html[0].querySelector(`input[name="${settingId}"]`);
	stringInputElement.classList.add("color");
	stringInputElement.after(colorPickerElement);
}
