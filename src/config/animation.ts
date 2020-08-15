export const waveStyles = {
	classic: 'Classic',
	centered: 'Centered',
};

export const blendModes = {
	overlay: 'Overlay',
	lighten: 'Lighten',
	multiply: 'Multiply',
};

// Colours for the background. There's so few it's not worth trying to do any clever generation
export const rainbowColours = [
	'#ff6968',
	'#fe6cb7',
	'#ff68f7',
	'#ff8cff',
	'#d78cff',
	'#8bb5fe',
	'#87ffff',
	'#88ff89',
	'#fed689',
	'#ff8d8b',
];

export const frameCount = rainbowColours.length;

// Again, hardcoding because it's easier than figuring out a formula for the animation path
export function getTransformationMatrices(
	waveStyle: keyof typeof waveStyles,
	canvasHeight: number,
	verticalAnchor: number
): number[][] {
	switch (waveStyle) {
		case 'classic':
			return [
				[1, 0, -0.177, 0.908, 0.177 * canvasHeight, 0.0918 * verticalAnchor],
				[1, 0, 0, 1, 0 * canvasHeight, 0 * verticalAnchor],
				[1.056, 0, 0.219, 0.948, -0.215 * canvasHeight, 0.0516 * verticalAnchor],
				[1, 0, 0.346, 0.871, -0.348 * canvasHeight, 0.129 * verticalAnchor],
				[0.96, 0, 0.26, 0.878, -0.321 * canvasHeight, 0.122 * verticalAnchor],
				[0.887, 0, 0.166, 0.812, -0.18 * canvasHeight, 0.189 * verticalAnchor],
				[0.918, 0, -0.023, 0.776, 0.015 * canvasHeight, 0.224 * verticalAnchor],
				[0.943, 0, -0.187, 0.722, 0.164 * canvasHeight, 0.278 * verticalAnchor],
				[1.072, 0, -0.206, 0.789, 0.169 * canvasHeight, 0.211 * verticalAnchor],
				[1.016, 0, -0.267, 0.827, 0.283 * canvasHeight, 0.173 * verticalAnchor],
			];
	}

	return [];
}
