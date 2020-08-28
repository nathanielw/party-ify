export const waveStyles = {
	classic: 'Classic',
	centered: 'Centered',
	bounce: 'Bounce/bop',
};

export const blendModes = {
	overlay: 'Overlay',
	lighten: 'Lighten',
	multiply: 'Multiply',
};

// Colours for the background. There's so few it's not worth trying to do any clever generation
export const colours = {
	classic: [
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
	],
	kakapo: [
		'#53752e',
		'#678d31',
		'#74a145',
		'#94d64d',
		'#97e346',
		'#aaf757',
		'#93d64b',
		'#91bd62',
		'#84b352',
		'#48820a',
	],
	cockatoo: [
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
		'#ffffff',
	],
	galah: ['#ff79f8', '#ff57cb', '#ff329a', '#ff0968', '#f60088', '#fa31ff', '#f72fa7', '#f34bc6', '#f48dff', '#f2a2ff'],
	king: ['#549310', '#6bab12', '#f2be03', '#fc9e41', '#f57118', '#d17205', '#fa8d2d', '#ed881c', '#e5cf24', '#9aae04'],
	hyacinth: [
		'#46f6ff',
		'#007efe',
		'#009fff',
		'#0029c9',
		'#3b4ee4',
		'#5e72ff',
		'#0095ff',
		'#00b2ff',
		'#00ccff',
		'#00e2ff',
	],
};

export const colourLabels: { [key in keyof typeof colours]: string } = {
	classic: 'Classic',
	kakapo: 'Kākāpō green',
	cockatoo: 'Cockatoo white',
	galah: 'Galah pink',
	hyacinth: 'Hyacinth blue',
	king: 'King green+orange',
};

export const frameCount = 10; // This could be made more flexible with some LCM math to allow for different frame counts

// Again, hardcoding because it's easier than figuring out a formula for the animation path
// The transformations are based on a canvas size of 200x200px, which is Not Great™, but sufficient for what this is (a hack)
export function getTransformationMatrices(
	waveStyle: keyof typeof waveStyles,
	// imageSizing: ImageSizing,
	verticalAnchor: number,
	magnitude: number
): number[][] {
	switch (waveStyle) {
		// The 1 - (1 - x) format is a bit weird, but makes it tweak the base value (x), rather than having to mentally do subtraction
		case 'centered':
			return [
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0.223 * magnitude, 1 - (1 - 0.944) * magnitude, -33.375 * magnitude, 8.43 * verticalAnchor * magnitude],
				[1, 0, 0.326 * magnitude, 1 - (1 - 0.84) * magnitude, -48.94 * magnitude, 23.813 * verticalAnchor * magnitude],
				[1, 0, 0.315 * magnitude, 1 - (1 - 0.75) * magnitude, -47.25 * magnitude, 37.3 * verticalAnchor * magnitude],
				[1, 0, 0.236 * magnitude, 1 - (1 - 0.685) * magnitude, -35.44 * magnitude, 47.25 * verticalAnchor * magnitude],
				[1, 0, 0, 1 - (1 - 0.66) * magnitude, 0, 50 * verticalAnchor * magnitude],
				[1, 0, -0.236 * magnitude, 1 - (1 - 0.685) * magnitude, 35.44 * magnitude, 47.25 * verticalAnchor * magnitude],
				[1, 0, -0.315 * magnitude, 1 - (1 - 0.75) * magnitude, 47.25 * magnitude, 37.3 * verticalAnchor * magnitude],
				[1, 0, -0.326 * magnitude, 1 - (1 - 0.84) * magnitude, 48.94 * magnitude, 23.813 * verticalAnchor * magnitude],
				[1, 0, -0.223 * magnitude, 1 - (1 - 0.944) * magnitude, 33.375 * magnitude, 8.43 * verticalAnchor * magnitude],
			];
		case 'bounce':
			return [
				[
					1 - (1 - 0.947) * magnitude,
					0,
					0,
					1 - (1 - 1.22) * magnitude,
					5.35 * magnitude,
					-32.43 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.952) * magnitude,
					0,
					0,
					1 - (1 - 1.182) * magnitude,
					4.85 * magnitude,
					-27.189 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.97) * magnitude,
					0,
					0,
					1 - (1 - 1.152) * magnitude,
					3.01 * magnitude,
					-22.699 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.002) * magnitude,
					0,
					0,
					1 - (1 - 1.087) * magnitude,
					-0.167 * magnitude,
					-12.97 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.062) * magnitude,
					0,
					0,
					1 - (1 - 0.99) * magnitude,
					-6.187 * magnitude,
					1.49 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.122) * magnitude,
					0,
					0,
					1 - (1 - 0.898) * magnitude,
					-12.207 * magnitude,
					15.22 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.15) * magnitude,
					0,
					0,
					1 - (1 - 0.847) * magnitude,
					-15.05 * magnitude,
					22.95 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.167) * magnitude,
					0,
					0,
					1 - (1 - 0.84) * magnitude,
					-16.72 * magnitude,
					23.947 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.127) * magnitude,
					0,
					0,
					1 - (1 - 0.902) * magnitude,
					-12.71 * magnitude,
					14.72 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.98) * magnitude,
					0,
					0,
					1 - (1 - 1.11) * magnitude,
					2.17 * magnitude,
					-16.71 * verticalAnchor * magnitude,
				],
			];
		case 'classic':
			return [
				[1, 0, 0, 1, 0, 0],
				[
					1 - (1 - 0.99375) * magnitude,
					0,
					0.16679 * magnitude,
					1 - (1 - 0.95027) * magnitude,
					-30.3727 * magnitude,
					7.245 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.04125) * magnitude,
					0,
					0.2315 * magnitude,
					1 - (1 - 0.8621) * magnitude,
					-50.84534 * magnitude,
					20.088 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.0) * magnitude,
					0,
					0.28054 * magnitude,
					1 - (1 - 0.82325) * magnitude,
					-51.28815 * magnitude,
					25.97 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.94375) * magnitude,
					0,
					0.11371 * magnitude,
					1 - (1 - 0.80963) * magnitude,
					-27.00883 * magnitude,
					27.8 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.91125) * magnitude,
					0,
					0.04853 * magnitude,
					1 - (1 - 0.766) * magnitude,
					9.24426 * magnitude,
					34.19 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.9825) * magnitude,
					0,
					-0.17287 * magnitude,
					1 - (1 - 0.70702) * magnitude,
					25.55122 * magnitude,
					42.85 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.02125) * magnitude,
					0,
					-0.2405 * magnitude,
					1 - (1 - 0.77915) * magnitude,
					34.20272 * magnitude,
					32.26 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 1.02375) * magnitude,
					0,
					-0.28875 * magnitude,
					1 - (1 - 0.8225) * magnitude,
					46.15469 * magnitude,
					26.16 * verticalAnchor * magnitude,
				],
				[
					1 - (1 - 0.9975) * magnitude,
					0,
					-0.1975 * magnitude,
					1 - (1 - 0.91375) * magnitude,
					30.20937 * magnitude,
					12.71 * verticalAnchor * magnitude,
				],
			];
	}

	return [];
}
