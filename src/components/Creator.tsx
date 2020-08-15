import React, { useState, useEffect } from 'react';
import FileSelector from './FileSelector';
import MessagePreview from './MessagePreview';
import Settings, { SettingsValues, defaultSettings } from './Settings';
import { frameCount, getTransformationMatrices, rainbowColours } from '../config/animation';

const maxWidth = 128;
const maxHeight = maxWidth;
const frameDuration = 50;

export default function Creator(): JSX.Element {
	const [settings, setSettings] = useState<SettingsValues>({
		...defaultSettings,
	});

	const [image] = useState<HTMLImageElement>(new Image());
	const [scaledImageCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'));
	const [offscreenProcessingCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'));
	const [imageMeta, setImageMeta] = useState({ loaded: false, width: 0, height: 0 });
	const [lastRenderIteration, setLastRenderIteration] = useState(0);
	const [lastRenderTime, setLastRenderTime] = useState(0);

	const onFileSelected = (file: File | undefined) => {
		image.src = URL.createObjectURL(file);

		image.onload = () => {
			setImageMeta({
				loaded: true,
				width: image.width,
				height: image.height,
			});
		};
	};

	useEffect(() => {
		if (!imageMeta.loaded) {
			return;
		}

		// Process outline:
		// - Scale the canvas to match the image aspect-ratio, and be within our maximum dimensions
		// - Draw the image
		// - Convert the image to grayscale
		// - Start the animation loop, which does the hard work

		const scaleAmount = Math.min(maxWidth / imageMeta.width, maxHeight / imageMeta.height);

		const imageRegionWidth = scaleAmount > 1 ? imageMeta.width : imageMeta.width * scaleAmount;
		const imageRegionHeight = scaleAmount > 1 ? imageMeta.height : imageMeta.height * scaleAmount;
		const padding = { x: imageRegionWidth * 0.4, y: imageRegionHeight * 0.1 };
		const canvasWidth = imageRegionWidth + padding.x * 2;
		const canvasHeight = imageRegionHeight + padding.y * 2;

		offscreenProcessingCanvas.width = scaledImageCanvas.width = canvasWidth;
		offscreenProcessingCanvas.height = scaledImageCanvas.height = canvasHeight;

		const scaledImageCtx = scaledImageCanvas.getContext('2d');
		const offscreenProcessingCtx = offscreenProcessingCanvas.getContext('2d');

		if (!scaledImageCtx || !offscreenProcessingCtx) {
			return;
		}

		scaledImageCtx.drawImage(image, padding.x, padding.y, imageRegionWidth, imageRegionHeight);

		// Convert to grayscale
		const grayscaleImage = scaledImageCtx.getImageData(0, 0, canvasWidth, canvasHeight);
		const pixels = grayscaleImage.data;

		for (let i = 0; i < pixels.length; i += 4) {
			const brightness = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
			pixels[i] = brightness;
			pixels[i + 1] = brightness;
			pixels[i + 2] = brightness;
		}

		scaledImageCtx.putImageData(grayscaleImage, 0, 0);

		let updateLoopRef: number | undefined;
		let renderIteration = lastRenderIteration;
		let lastUpdatedAt = lastRenderTime || Date.now();

		const updateLoop = () => {
			offscreenProcessingCtx.globalCompositeOperation = 'source-over';
			offscreenProcessingCtx.clearRect(0, 0, canvasWidth, canvasHeight);

			offscreenProcessingCtx.setTransform(
				...(getTransformationMatrices(
					settings.waveStyle,
					canvasHeight,
					(imageRegionHeight + padding.y) * settings.verticalCenter
				)[renderIteration] as DOMMatrix2DInit[])
			);
			// draw base image
			offscreenProcessingCtx.globalCompositeOperation = 'source-over';
			offscreenProcessingCtx.drawImage(scaledImageCanvas, 0, 0);
			// overlay the colour blend
			offscreenProcessingCtx.globalCompositeOperation = 'overlay';
			offscreenProcessingCtx.fillStyle = rainbowColours[renderIteration];
			offscreenProcessingCtx.fillRect(0, 0, canvasWidth, canvasHeight);

			// mask using the original image
			offscreenProcessingCtx.globalCompositeOperation = 'destination-in';
			offscreenProcessingCtx.drawImage(image, padding.x, padding.y, imageRegionWidth, imageRegionHeight);

			const now = Date.now();
			const timeDiff = now - lastUpdatedAt;
			const elapsedFrames = Math.floor(timeDiff / frameDuration);
			renderIteration = (renderIteration + elapsedFrames) % frameCount;
			if (elapsedFrames > 0) {
				lastUpdatedAt = now;
			}

			updateLoopRef = window.requestAnimationFrame(updateLoop);
		};

		updateLoop();

		return () => {
			if (updateLoopRef) {
				window.cancelAnimationFrame(updateLoopRef);

				// Remember where in the loop we were for less janky updates while changing settings
				// TODO: This barely works / still looks pretty bad
				setLastRenderIteration(renderIteration);
				setLastRenderTime(lastUpdatedAt);
			}
		};
	}, [imageMeta, settings]);

	// For debugging
	document.body.appendChild(scaledImageCanvas);
	document.body.appendChild(offscreenProcessingCanvas);

	return (
		<section className='Creator'>
			<FileSelector onFileSelected={onFileSelected} />

			<div className='SettingsContainer'>
				<Settings onSettingsChanged={setSettings} />
				<div className='SettingsContainer__Section'>
					<canvas />

					<MessagePreview />
				</div>
			</div>

			<button type='button' className='Button'>
				3. Generate GIF
			</button>
		</section>
	);
}
