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
// The transformations are based on a canvas size of 200x200px, which is Not Great™, but sufficient for what this is (a hack)
export function getTransformationMatrices(
	waveStyle: keyof typeof waveStyles,
	// imageSizing: ImageSizing,
	verticalAnchor: number
): number[][] {
	switch (waveStyle) {
		case 'classic':
			return [
				[1, 0, 0, 1, 0, 0],
				[0.99375, 0, 0.16679, 0.95027, -30.3727, 7.245 * verticalAnchor],
				[1.04125, 0, 0.2315, 0.8621, -50.84534, 20.088 * verticalAnchor],
				[1.0, 0, 0.28054, 0.82325, -51.28815, 25.97 * verticalAnchor],
				[0.94375, 0, 0.11371, 0.80963, -27.00883, 27.8 * verticalAnchor],
				[0.91125, 0, 0.04853, 0.766, 9.24426, 34.19 * verticalAnchor],
				[0.9825, 0, -0.17287, 0.70702, 25.55122, 42.85 * verticalAnchor],
				[1.02125, 0, -0.2405, 0.77915, 34.20272, 32.26 * verticalAnchor],
				[1.02375, 0, -0.28875, 0.8225, 46.15469, 26.16 * verticalAnchor],
				[0.9975, 0, -0.1975, 0.91375, 30.20937, 12.71 * verticalAnchor],
			];
	}

	return [];
}
