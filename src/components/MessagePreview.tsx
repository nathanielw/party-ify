import React, { useEffect, useRef } from 'react';
import { PreviewRenderListener, ImageSizing } from './Creator';

export default function MessagePreview(props: {
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

		const listener = (canvas: HTMLCanvasElement, imageSizing: ImageSizing) => {
			const scale = Math.min(canvasWidth / imageSizing.canvasWidth, canvasHeight / imageSizing.canvasHeight);

			previewCanvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
			previewCanvasCtx.drawImage(canvas, 0, 0, scale * imageSizing.canvasWidth, scale * imageSizing.canvasHeight);
		};

		props.onReady(listener);

		return () => {
			props.onDestroy(listener);
		};
	}, [props.onReady, props.onDestroy]);
	return (
		<figure className='MessagePreview'>
			<span role='presentation' className='MessagePreview__Avatar' />
			<p className='MessagePreview__Text'>@channel it&apos;s party time!</p>
			<canvas className='MessagePreview__Emoji' ref={previewCanvasRef} width='22px' height='22px' />
		</figure>
	);
}
