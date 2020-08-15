import React from 'react';

export default function MessagePreview(): JSX.Element {
	return (
		<figure className='MessagePreview'>
			<span role='presentation' className='MessagePreview__Avatar' />
			<p className='MessagePreview__Text'>@channel it&apos;s party time!</p>
			<canvas className='MessagePreview__Emoji' />
		</figure>
	);
}
