import React, { useRef } from 'react';
import { waveStyles, blendModes } from '../config/animation';

export interface SettingsValues {
	waveStyle: keyof typeof waveStyles;
	blendMode: keyof typeof blendModes;
	verticalCenter: number;
}

export const defaultSettings: SettingsValues = {
	waveStyle: 'classic',
	blendMode: 'overlay',
	verticalCenter: 1,
};

export default function Settings(props: { onSettingsChanged: (values: SettingsValues) => void }): JSX.Element {
	const waveInputRef = useRef<HTMLSelectElement>(null);
	const centerInputRef = useRef<HTMLInputElement>(null);
	const blendInputRef = useRef<HTMLSelectElement>(null);

	const onInputChange = () => {
		const newSettings: SettingsValues = {
			waveStyle: (waveInputRef.current?.value as keyof typeof waveStyles) ?? defaultSettings.waveStyle,
			blendMode: (blendInputRef.current?.value as keyof typeof blendModes) ?? defaultSettings.blendMode,
			verticalCenter:
				centerInputRef.current?.value != null
					? Number.parseFloat(centerInputRef.current?.value)
					: defaultSettings.verticalCenter,
		};

		props.onSettingsChanged(newSettings);
	};

	return (
		<div className='Settings SettingsContainer__Section'>
			<h2 className='Heading Heading--2'>2. Settings</h2>
			<label className='Settings__Label' htmlFor='wave-select'>
				Wavey style:
			</label>
			{/* eslint-disable-next-line jsx-a11y/no-onchange */}
			<select className='Settings__Input' id='wave-select' ref={waveInputRef} onChange={onInputChange}>
				{Object.keys(waveStyles).map((key) => (
					<option key={key} value={key}>
						{waveStyles[key as keyof typeof waveStyles]}
					</option>
				))}
			</select>

			<label className='Settings__Label' htmlFor='center-slider'>
				Vertical center:
			</label>
			{/* TODO: sort out the scale transform so the min/max of this can be more logical numbers */}
			<input
				className='Settings__Input'
				id='center-slider'
				type='range'
				min='-0.65'
				max='2'
				step='0.05'
				ref={centerInputRef}
				defaultValue={defaultSettings.verticalCenter}
				onChange={onInputChange}
			/>

			<label className='Settings__Label' htmlFor='blend-select'>
				Rainbow blend mode:
			</label>
			{/* eslint-disable-next-line jsx-a11y/no-onchange */}
			<select className='Settings__Input' id='blend-select' ref={blendInputRef} onChange={onInputChange}>
				{Object.keys(blendModes).map((key) => (
					<option key={key} value={key}>
						{blendModes[key as keyof typeof blendModes]}
					</option>
				))}
			</select>
		</div>
	);
}
