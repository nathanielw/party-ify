import React from 'react';

export default function Settings(): JSX.Element {
	return (
		<div className='Settings SettingsContainer__Section'>
			<h2 className='Heading Heading--2'>2. Settings</h2>
			<label className='Settings__Label' htmlFor='wave-select'>
				Wavey style:
			</label>
			<select className='Settings__Input' id='wave-select'>
				<option>Classic</option>
				<option>Centered</option>
			</select>

			<label className='Settings__Label' htmlFor='centre-slider'>
				Vertical centre:
			</label>
			<input className='Settings__Input' id='centre-slider' type='range' min='0' max='1' step='0.05' />

			<label className='Settings__Label' htmlFor='blend-select'>
				Wavey style:
			</label>
			<select className='Settings__Input' id='blend-select'>
				<option>Overlay</option>
				<option>Lighten</option>
				<option>Multiply</option>
			</select>
		</div>
	);
}
