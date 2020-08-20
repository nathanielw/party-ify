import React, { useEffect, useRef } from 'react';
import { PreviewRenderListener } from './Creator';

export default function MessagePreview({
	onReady,
	onDestroy,
}: {
	onReady: (listener: PreviewRenderListener) => void;
	onDestroy: (listener: PreviewRenderListener) => void;
}): JSX.Element {
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const previewCanvas = previewCanvasRef.current;
		const previewCanvasCtx = previewCanvas?.getContext('2d');

		if (!previewCanvas || !previewCanvasCtx) {
			return;
		}

		const canvasWidth = previewCanvas.width;
		const canvasHeight = previewCanvas?.height;

		const listener = (canvas: HTMLCanvasElement, sourceWidth: number, sourceHeight: number) => {
			const scale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);

			const outputWidth = scale * sourceWidth;
			const outputHeight = scale * sourceHeight;

			const offsetX = (canvasWidth - outputWidth) / 2;
			const offsetY = (canvasHeight - outputHeight) / 2;

			previewCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
			previewCanvasCtx.drawImage(canvas, offsetX, offsetY, outputWidth, outputHeight);
		};

		onReady(listener);

		return () => {
			onDestroy(listener);
		};
	}, [onReady, onDestroy]);
	return (
		<figure className='MessagePreview'>
			<span role='presentation' className='MessagePreview__Avatar' />
			<p className='MessagePreview__Text'>@channel it&apos;s party time!</p>
			<canvas className='MessagePreview__Emoji' ref={previewCanvasRef} width='22px' height='22px' />
		</figure>
	);
}
