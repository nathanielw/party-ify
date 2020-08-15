import React, { useState, useEffect } from 'react';
import FileSelector from './FileSelector';
import MessagePreview from './MessagePreview';
import Settings, { SettingsValues, defaultSettings } from './Settings';
import { frameCount, getTransformationMatrices, rainbowColours } from '../config/animation';

const maxWidth = 128;
const maxHeight = maxWidth;
const frameDuration = 50;

interface ImageMeta {
	loaded: boolean;
	width: number;
	height: number;
}

interface ImageSizing {
	canvasWidth: number;
	canvasHeight: number;
	imageRegionWidth: number;
	imageRegionHeight: number;
	padding: { x: number; y: number };
}

/**
 * Calculates info needed to size the output canvas, based on the provided image information
 */
function getImageSizing(imageMeta: ImageMeta): ImageSizing {
	const scaleAmount = Math.min(maxWidth / imageMeta.width, maxHeight / imageMeta.height);

	const imageRegionWidth = scaleAmount > 1 ? imageMeta.width : imageMeta.width * scaleAmount;
	const imageRegionHeight = scaleAmount > 1 ? imageMeta.height : imageMeta.height * scaleAmount;
	const padding = { x: imageRegionWidth * 0.4, y: imageRegionHeight * 0.1 };

	const canvasWidth = imageRegionWidth + padding.x * 2;
	const canvasHeight = imageRegionHeight + padding.y * 2;

	return {
		canvasWidth,
		canvasHeight,
		imageRegionWidth,
		imageRegionHeight,
		padding,
	};
}

function setCanvasSizes(imageSizing: ImageSizing, ...canvases: HTMLCanvasElement[]) {
	canvases.forEach((canvas) => {
		canvas.width = imageSizing.canvasWidth;
		canvas.height = imageSizing.canvasHeight;
	});
}

/**
 * Pre-renders static things that are used by the main render function.
 * @param imageSizing Sizing info to use to position the image
 * @param preProcessedImageCtx Canvas context where the pre-processed image will be drawn
 * @param image Image to draw
 */
function prepForRender(
	imageSizing: ImageSizing,
	preProcessedImageCtx: CanvasRenderingContext2D,
	image: HTMLImageElement
) {
	preProcessedImageCtx.drawImage(
		image,
		imageSizing.padding.x,
		imageSizing.padding.y,
		imageSizing.imageRegionWidth,
		imageSizing.imageRegionHeight
	);

	// Convert to grayscale
	const grayscaleImage = preProcessedImageCtx.getImageData(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight);
	const pixels = grayscaleImage.data;

	for (let i = 0; i < pixels.length; i += 4) {
		const brightness = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
		pixels[i] = brightness;
		pixels[i + 1] = brightness;
		pixels[i + 2] = brightness;
	}

	preProcessedImageCtx.putImageData(grayscaleImage, 0, 0);
}

function renderFrame(
	frameNumber: number,
	canvasCtx: CanvasRenderingContext2D,
	imageSource: CanvasImageSource,
	imageSizing: ImageSizing,
	settings: SettingsValues
) {
	canvasCtx.globalCompositeOperation = 'source-over';
	canvasCtx.clearRect(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight);

	canvasCtx.setTransform(
		...(getTransformationMatrices(
			settings.waveStyle,
			imageSizing.canvasHeight,
			(imageSizing.imageRegionHeight + imageSizing.padding.y) * settings.verticalCenter
		)[frameNumber] as DOMMatrix2DInit[])
	);
	// draw base image
	canvasCtx.globalCompositeOperation = 'source-over';
	canvasCtx.drawImage(imageSource, 0, 0);
	// overlay the colour blend
	canvasCtx.globalCompositeOperation = 'overlay';
	canvasCtx.fillStyle = rainbowColours[frameNumber];
	canvasCtx.fillRect(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight);

	// mask using the original image
	canvasCtx.globalCompositeOperation = 'destination-in';
	canvasCtx.drawImage(imageSource, 0, 0);
}

export default function Creator(): JSX.Element {
	const [settings, setSettings] = useState<SettingsValues>({
		...defaultSettings,
	});

	const [image] = useState<HTMLImageElement>(new Image());
	const [imagePrepCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'));
	const [offscreenOutputCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'));
	const [imageMeta, setImageMeta] = useState<ImageMeta>({ loaded: false, width: 0, height: 0 });
	const [lastRenderIteration, setLastRenderIteration] = useState(0);
	const [lastRenderTime, setLastRenderTime] = useState(0);
	const [outputImageBlobUrl, setOutputImageBlobUrl] = useState<string | null>(null);

	const onFileSelected = (file: File | undefined) => {
		image.src = URL.createObjectURL(file);

		image.onload = () => {
			setImageMeta({
				loaded: true,
				width: image.width,
				height: image.height,
			});
		};

		// Clear the existing output, to avoid confusion
		setOutputImageBlobUrl(null);
	};

	useEffect(() => {
		const imagePrepCtx = imagePrepCanvas.getContext('2d');
		const offscreenOutputCtx = offscreenOutputCanvas.getContext('2d');

		if (!imageMeta.loaded || !imagePrepCtx || !offscreenOutputCtx) {
			return;
		}

		const imageSizing = getImageSizing(imageMeta);

		setCanvasSizes(imageSizing, imagePrepCanvas, offscreenOutputCanvas);
		prepForRender(imageSizing, imagePrepCtx, image);

		let updateLoopRef: number | undefined;
		let renderIteration = lastRenderIteration;
		let lastUpdatedAt = lastRenderTime || performance.now();
		let lastLoopedAt = lastUpdatedAt;

		const updateLoop = () => {
			const now = performance.now();
			const timeDiff = now - lastUpdatedAt;
			const timeSinceLastLoop = now - lastLoopedAt;

			// Add half the time since the last RAF call, to smooth out / factor for the next update potentially being further from the frame duration than this one
			const elapsedFrames = Math.floor((timeDiff + timeSinceLastLoop / 2) / frameDuration);
			renderIteration = (renderIteration + elapsedFrames) % frameCount;
			lastLoopedAt = now;

			if (elapsedFrames > 0) {
				lastUpdatedAt = now;

				renderFrame(renderIteration, offscreenOutputCtx, imagePrepCanvas, imageSizing, settings);
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
	document.body.appendChild(imagePrepCanvas);
	document.body.appendChild(offscreenOutputCanvas);

	const generateGif = () => {
		if (!imageMeta.loaded || !window.GIF) {
			return;
		}

		const gifImagePrepCanvas = document.createElement('canvas');
		const gifOutputCanvas = document.createElement('canvas');

		const imagePrepCtx = gifImagePrepCanvas.getContext('2d');
		const outputProcessingCtx = gifOutputCanvas.getContext('2d');

		if (!imagePrepCtx || !outputProcessingCtx) {
			return;
		}

		const imageSizing = getImageSizing(imageMeta);
		setCanvasSizes(imageSizing, gifImagePrepCanvas, gifOutputCanvas);
		prepForRender(imageSizing, imagePrepCtx, image);

		const gifRenderer = new window.GIF({
			workers: 4,
			workerScript: '/vendor/gif.worker.js',
			width: imageSizing.canvasWidth,
			height: imageSizing.canvasHeight,
			transparent: 0x00000000,
		});

		gifRenderer.on('finished', (blob: Blob) => {
			setOutputImageBlobUrl(URL.createObjectURL(blob));
		});

		for (let frameNumber = 0; frameNumber < frameCount; frameNumber++) {
			renderFrame(frameNumber, outputProcessingCtx, imagePrepCanvas, imageSizing, settings);
			gifRenderer.addFrame(outputProcessingCtx, { delay: 50, copy: true });
		}

		gifRenderer.render();
	};

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

			<button type='button' className='Button' onClick={generateGif}>
				3. Generate GIF
			</button>

			{outputImageBlobUrl && (
				<>
					<p>Right click / long-press on the image, choose save, and get the party started!</p>
					<img alt='' src={outputImageBlobUrl} />
				</>
			)}
		</section>
	);
}
