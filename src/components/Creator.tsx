import React, { useState, useEffect, useRef, useMemo } from 'react';
import FileSelector from './FileSelector';
import MessagePreview from './MessagePreview';
import Settings, { SettingsValues, defaultSettings } from './Settings';
import { frameCount, getTransformationMatrices, colours, colourLabels } from '../config/animation';

const maxWidth = 100;
const maxHeight = maxWidth;
const frameDuration = 50;

interface ImageMeta {
	loaded: boolean;
	width: number;
	height: number;
}

interface CropBounds {
	top: number;
	left: number;
	right: number;
	bottom: number;
}

interface ImageSizing {
	canvasWidth: number;
	canvasHeight: number;
	imageRegionWidth: number;
	imageRegionHeight: number;
}

interface CachedFrameData {
	frames: ImageData[];
	crop: CropBounds;
}

export type PreviewRenderListener = (canvas: HTMLCanvasElement, sourceWidth: number, sourceHight: number) => void;

/**
 * Gets the bounds of the non-transparent image data.
 * Represented as distance from the top-left corner of the provided canvas.
 */
function getPixelBoundsForCanvas(ctx: CanvasRenderingContext2D): CropBounds {
	const width = ctx.canvas.width;
	const height = ctx.canvas.height;

	const pixels = ctx.getImageData(0, 0, width, height);
	const pixelDataLength = pixels.data.length;

	const bounds = {
		top: height / 2,
		left: width / 2,
		right: width / 2,
		bottom: height / 2,
	};

	let x,
		y = 0;

	// Based on https://gist.github.com/remy/784508
	for (let i = 0; i < pixelDataLength; i += 4) {
		if (pixels.data[i + 3] !== 0) {
			x = (i / 4) % width;
			y = ~~(i / 4 / width);

			if (y < bounds.top) {
				bounds.top = y;
			}

			if (x < bounds.left) {
				bounds.left = x;
			}

			if (x > bounds.right) {
				bounds.right = x;
			}

			if (y > bounds.bottom) {
				bounds.bottom = y;
			}
		}
	}

	bounds.bottom += 1;
	bounds.right += 1;

	return bounds;
}

function getPixelBounds(image: CanvasImageSource): CropBounds {
	const cropperCanvas = document.createElement('canvas');
	cropperCanvas.width = image.width as number;
	cropperCanvas.height = image.height as number;

	const cropperCtx = cropperCanvas.getContext('2d');

	if (!cropperCtx) {
		return {
			top: 0,
			left: 0,
			right: image.width as number,
			bottom: image.height as number,
		};
	}

	cropperCtx.drawImage(image, 0, 0);
	const bounds = getPixelBoundsForCanvas(cropperCtx);

	return bounds;
}

/**
 * Calculates info needed to size the output canvas, based on the provided image information
 */
function getImageSizing(imageMeta: ImageMeta): ImageSizing {
	const width = imageMeta.width;
	const height = imageMeta.height;

	const scaleAmount = Math.min(1, maxWidth / width, maxHeight / height);

	const imageRegionWidth = width * scaleAmount;
	const imageRegionHeight = height * scaleAmount;

	return {
		canvasWidth: maxWidth * 2, // These are hardcoded for the sake of keeping the transformation matrices simple and static
		canvasHeight: maxHeight * 2,
		imageRegionWidth,
		imageRegionHeight,
	};
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
	image: HTMLImageElement,
	settings: SettingsValues
) {
	preProcessedImageCtx.drawImage(
		image,
		0,
		0,
		image.width,
		image.height,
		(imageSizing.canvasWidth - imageSizing.imageRegionWidth) / 2,
		(imageSizing.canvasHeight - imageSizing.imageRegionHeight) / 2,
		imageSizing.imageRegionWidth,
		imageSizing.imageRegionHeight
	);

	// Convert to grayscale
	const grayscaleImage = preProcessedImageCtx.getImageData(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight);
	const pixels = grayscaleImage.data;

	const brightnessFactor = settings.brightness;
	const contrast = settings.contrast * 254;
	const contrastFactor = (255 + contrast) / (255 - contrast);

	for (let i = 0; i < pixels.length; i += 4) {
		const brightness = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
		const valueAdjusted = brightnessFactor * (contrastFactor * (brightness - 128) + 128);

		pixels[i] = valueAdjusted;
		pixels[i + 1] = valueAdjusted;
		pixels[i + 2] = valueAdjusted;
	}

	preProcessedImageCtx.putImageData(grayscaleImage, 0, 0);
}

/**
 * Renders all frames of the animation and returns them as ImageData, along with info on how the final frames should be cropped
 */
function generateCachedFrames(
	settings: SettingsValues,
	imageSizing: ImageSizing,
	image: CanvasImageSource
): CachedFrameData | null {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		return null;
	}

	const cachedFrames = [];

	canvas.width = imageSizing.canvasWidth;
	canvas.height = imageSizing.canvasHeight;

	const maximalBounds = {
		top: canvas.height,
		left: canvas.width,
		right: 0,
		bottom: 0,
	};

	const transformationMatrices = getTransformationMatrices(
		settings.waveStyle,
		settings.verticalCenter,
		settings.magnitude
	);

	for (let i = 0; i < frameCount; i++) {
		renderFrame(i, ctx, image, imageSizing, settings, transformationMatrices);
		cachedFrames.push(ctx.getImageData(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight));

		const computedBounds = getPixelBounds(canvas);

		maximalBounds.top = Math.min(computedBounds.top, maximalBounds.top);
		maximalBounds.left = Math.min(computedBounds.left, maximalBounds.left);
		maximalBounds.right = Math.max(computedBounds.right, maximalBounds.right);
		maximalBounds.bottom = Math.max(computedBounds.bottom, maximalBounds.bottom);
	}

	return { frames: cachedFrames, crop: maximalBounds };
}

function renderFrame(
	frameNumber: number,
	canvasCtx: CanvasRenderingContext2D,
	imageSource: CanvasImageSource,
	imageSizing: ImageSizing,
	settings: SettingsValues,
	transformationMatrices: number[][]
) {
	const frameTransformation = transformationMatrices[frameNumber % transformationMatrices.length] ?? [];
	canvasCtx.globalCompositeOperation = 'source-over';
	canvasCtx.clearRect(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight);

	canvasCtx.setTransform(...(frameTransformation as DOMMatrix2DInit[]));
	// draw base image
	canvasCtx.globalCompositeOperation = 'source-over';
	canvasCtx.drawImage(imageSource, 0, 0);
	// overlay the colour blend
	canvasCtx.globalCompositeOperation = settings.blendMode;
	canvasCtx.fillStyle = colours[settings.colourScheme][frameNumber];
	canvasCtx.fillRect(0, 0, imageSizing.canvasWidth, imageSizing.canvasHeight);

	// mask using the original image
	canvasCtx.globalCompositeOperation = 'destination-in';
	canvasCtx.drawImage(imageSource, 0, 0);
}

function renderCachedFrame(canvasCtx: CanvasRenderingContext2D, cachedFrame: ImageData, crop: CropBounds) {
	canvasCtx.putImageData(cachedFrame, -crop.left, -crop.top);
}

export default function Creator(): JSX.Element {
	const [settings, setSettings] = useState<SettingsValues>({
		...defaultSettings,
	});

	const [image] = useState<HTMLImageElement>(new Image());
	const [imagePrepCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'));
	const [imageMeta, setImageMeta] = useState<ImageMeta>({ loaded: false, width: 0, height: 0 });
	const [lastRenderIteration, setLastRenderIteration] = useState(0);
	const [lastRenderTime, setLastRenderTime] = useState(0);
	const [outputImageBlobUrl, setOutputImageBlobUrl] = useState<string | null>(null);
	const [previewRenderListeners, setPreviewRenderListeners] = useState<PreviewRenderListener[]>([]);
	const [cachedFrameData, setCachedFrameData] = useState<CachedFrameData | null>();

	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const outputElementRef = useRef<HTMLDivElement>(null);

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

	// TODO: Bit of a hackish way to notify the message preview when there's a new frame to render, leftover from an earlier approach
	// The more React-y way would be to pass the cached image data in
	const addPreviewRenderListener = useMemo(() => {
		return (listener: PreviewRenderListener) => {
			setPreviewRenderListeners((state) => {
				return [...state, listener];
			});
		};
	}, []);

	const removePreviewRenderListener = useMemo(() => {
		return (listener: PreviewRenderListener) => {
			setPreviewRenderListeners((state) => {
				return state.filter((l) => l !== listener);
			});
		};
	}, []);

	useEffect(() => {
		const imagePrepCtx = imagePrepCanvas.getContext('2d');

		const previewCanvas = previewCanvasRef.current;
		const previewCanvasCtx = previewCanvas?.getContext('2d');

		if (!imageMeta.loaded || !imagePrepCtx || !previewCanvas || !previewCanvasCtx) {
			return;
		}

		const imageSizing = getImageSizing(imageMeta);

		const canvasWidth = imageSizing.canvasWidth;
		const canvasHeight = imageSizing.canvasHeight;

		imagePrepCanvas.width = canvasWidth;
		imagePrepCanvas.height = canvasHeight;

		prepForRender(imageSizing, imagePrepCtx, image, settings);
		const cachedData = generateCachedFrames(settings, imageSizing, imagePrepCanvas);
		setCachedFrameData(cachedData);

		if (!cachedData) {
			return;
		}

		const previewWidth = (previewCanvas.width = cachedData.crop.right - cachedData.crop.left);
		const previewHeight = (previewCanvas.height = cachedData.crop.bottom - cachedData.crop.top);

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
				renderCachedFrame(previewCanvasCtx, cachedData.frames[renderIteration], cachedData.crop);

				previewRenderListeners.forEach((listener) => {
					listener(previewCanvas, previewWidth, previewHeight);
				});
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

	const generateGif = () => {
		if (!cachedFrameData || !window.GIF) {
			return;
		}

		const gifOutputCanvas = document.createElement('canvas');

		const width = (gifOutputCanvas.width = cachedFrameData.crop.right - cachedFrameData.crop.left);
		const height = (gifOutputCanvas.height = cachedFrameData.crop.bottom - cachedFrameData.crop.top);

		const outputProcessingCtx = gifOutputCanvas.getContext('2d');
		if (!outputProcessingCtx) {
			return;
		}

		const gifRenderer = new window.GIF({
			workers: 4,
			workerScript: '/vendor/gif.worker.js',
			width,
			height,
			transparent: 0x00000000,
		});

		gifRenderer.on('finished', (blob: Blob) => {
			setOutputImageBlobUrl(URL.createObjectURL(blob));
		});

		for (let frameNumber = 0; frameNumber < frameCount; frameNumber++) {
			renderCachedFrame(outputProcessingCtx, cachedFrameData.frames[frameNumber], cachedFrameData.crop);
			gifRenderer.addFrame(outputProcessingCtx, { delay: 50, copy: true });
		}

		gifRenderer.render();

		outputElementRef.current?.scrollIntoView();
	};

	return (
		<section className='Creator'>
			<FileSelector onFileSelected={onFileSelected} />

			<div className='SettingsContainer'>
				<Settings onSettingsChanged={setSettings} />
				<div className='SettingsContainer__Section PreviewSection'>
					<div className='PreviewSection__Big'>
						<canvas ref={previewCanvasRef} />
					</div>

					<MessagePreview onReady={addPreviewRenderListener} onDestroy={removePreviewRenderListener} />
				</div>
			</div>

			<button type='button' className='Button' onClick={generateGif}>
				3. Generate GIF
			</button>

			<div className='Output' ref={outputElementRef}>
				{outputImageBlobUrl && (
					<>
						<p>Right click / long-press on the image below, choose save, and get the party started!</p>
						<img className='Output__Image' alt='' src={outputImageBlobUrl} />
					</>
				)}
			</div>
		</section>
	);
}
