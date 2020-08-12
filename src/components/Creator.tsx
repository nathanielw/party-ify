import React from 'react';

export default function Creator(): JSX.Element {
	return (
		<section className='Creator'>
			<button type='button' className='Button'>
				1. Choose an image...
			</button>

			<div>
				<p>2. Settings</p>
			</div>

			<button type='button' className='Button'>
				3. Generate GIF
			</button>
		</section>
	);
}
