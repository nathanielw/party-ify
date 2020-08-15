import React from 'react';
import FileSelector from './FileSelector';
import MessagePreview from './MessagePreview';
import Settings from './Settings';

export default function Creator(): JSX.Element {
	const onFileSelected = (imageFile: File | undefined) => {
		console.log(imageFile);
	};

	return (
		<section className='Creator'>
			<FileSelector onFileSelected={onFileSelected} />

			<div className='SettingsContainer'>
				<Settings />
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
