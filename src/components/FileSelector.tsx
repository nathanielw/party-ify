import React, { useRef } from 'react';

export default function FileSelector(props: { onFileSelected: (fileUrl: File | undefined) => void }): JSX.Element {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = () => {
		props.onFileSelected(fileInputRef.current?.files?.[0]);
	};

	return (
		<>
			<input
				type='file'
				id='file-input'
				className='FileSelector__Input'
				onChange={handleFileChange}
				ref={fileInputRef}
			/>
			<label htmlFor='file-input' className='Button FileSelector__Label'>
				1. Choose an image...
			</label>
		</>
	);
}
