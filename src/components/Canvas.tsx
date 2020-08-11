import React, { useRef, useEffect } from 'react';

const targetWidth = 128;
const targetHeight = 128;

const padding = { x: targetWidth * 0.2, y: targetHeight * 0.1 };
const verticalAnchor = (targetWidth + padding.y) * 1;

const fullCanvasWidth = targetHeight + padding.x * 2;
const fullCanvasHeight = targetHeight + padding.y * 2;

// Colours for the background. There's so few it's not worth trying to do any clever generation
const rainbowColours = [
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

// Again, hardcoding because it's easier than figuring out a formula for the animation path
const transformationMatrices = [
	[1, 0, -0.177, 0.908, 0.177 * targetHeight, 0.0918 * verticalAnchor],
	[1, 0, 0, 1, 0 * targetHeight, 0 * verticalAnchor],
	[1.056, 0, 0.219, 0.948, -0.215 * targetHeight, 0.0516 * verticalAnchor],
	[1, 0, 0.346, 0.871, -0.348 * targetHeight, 0.129 * verticalAnchor],
	[0.96, 0, 0.26, 0.878, -0.321 * targetHeight, 0.122 * verticalAnchor],
	[0.887, 0, 0.166, 0.812, -0.18 * targetHeight, 0.189 * verticalAnchor],
	[0.918, 0, -0.023, 0.776, 0.015 * targetHeight, 0.224 * verticalAnchor],
	[0.943, 0, -0.187, 0.722, 0.164 * targetHeight, 0.278 * verticalAnchor],
	[1.072, 0, -0.206, 0.789, 0.169 * targetHeight, 0.211 * verticalAnchor],
	[1.016, 0, -0.267, 0.827, 0.283 * targetHeight, 0.173 * verticalAnchor],
];

export default function Canvas(): JSX.Element {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const imageEl = new Image();
		imageEl.crossOrigin = 'anonymous';
		imageEl.src = '/fire-emoji.png'; // "/parrot-base.png";

		const offscreenCanvas = document.createElement('canvas');
		offscreenCanvas.width = fullCanvasWidth;
		offscreenCanvas.height = fullCanvasHeight;
		const offscreenCtx = offscreenCanvas.getContext('2d');

		const canvasEl = canvasRef.current;
		const ctx = canvasEl?.getContext('2d');

		if (!canvasEl || !ctx || !offscreenCtx) {
			return;
		}

		let rafId: ReturnType<typeof window.requestAnimationFrame>;
		let renderIteration = 0;

		const render = () => {
			// Generate greyscale image
			// @ts-ignore
			offscreenCtx.setTransform(...transformationMatrices[renderIteration]);
			offscreenCtx.drawImage(imageEl, padding.x, padding.y, targetWidth, targetHeight);
			const greyscaleImage = offscreenCtx.getImageData(0, 0, fullCanvasWidth, fullCanvasHeight);
			const pixels = greyscaleImage.data;

			for (let i = 0; i < pixels.length; i += 4) {
				const brightness = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
				pixels[i] = brightness;
				pixels[i + 1] = brightness;
				pixels[i + 2] = brightness;
			}

			ctx.globalCompositeOperation = 'source-over';
			ctx.clearRect(padding.x, padding.y, targetWidth, targetHeight);

			// @ts-ignore
			ctx.setTransform(...transformationMatrices[renderIteration]);
			// draw base image
			ctx.globalCompositeOperation = 'source-over';
			// ctx.drawImage(imageEl, padding.x, padding.y, targetWidth, targetHeight);
			ctx.putImageData(greyscaleImage, 0, 0);
			// overlay the colour blend
			ctx.globalCompositeOperation = 'overlay';
			ctx.fillStyle = rainbowColours[renderIteration];
			ctx.fillRect(padding.x, padding.y, targetWidth, targetHeight);

			// mask using the original image
			ctx.globalCompositeOperation = 'destination-in';
			ctx.drawImage(imageEl, padding.x, padding.y, targetWidth, targetHeight);

			// ctx.putImageData(maskData, 0, 0);

			rafId = window.setTimeout(render, 50);
			renderIteration = (renderIteration + 1) % rainbowColours.length;
		};

		render();

		return () => {
			window.clearTimeout(rafId);
		};
	}, [canvasRef]);

	return (
		<div className='Canvas'>
			<canvas ref={canvasRef} width={`${fullCanvasWidth}px`} height={`${fullCanvasHeight}px`} />
		</div>
	);
}
