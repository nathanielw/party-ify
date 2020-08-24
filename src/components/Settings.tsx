import React, { useRef } from 'react';
import { waveStyles, blendModes, colourLabels } from '../config/animation';

export interface SettingsValues {
	waveStyle: keyof typeof waveStyles;
	blendMode: keyof typeof blendModes;
	verticalCenter: number;
	magnitude: number;
	colourScheme: keyof typeof colourLabels;
	contrast: number;
	brightness: number;
}

export const defaultSettings: SettingsValues = {
	waveStyle: 'classic',
	blendMode: 'overlay',
	verticalCenter: 1,
	magnitude: 1,
	colourScheme: 'classic',
	contrast: 0,
	brightness: 1,
};

export default function Settings(props: { onSettingsChanged: (values: SettingsValues) => void }): JSX.Element {
	const waveInputRef = useRef<HTMLSelectElement>(null);
	const centerInputRef = useRef<HTMLInputElement>(null);
	const magnitudeInputRef = useRef<HTMLInputElement>(null);
	const blendInputRef = useRef<HTMLSelectElement>(null);
	const colourInputRef = useRef<HTMLSelectElement>(null);
	const contrastInputRef = useRef<HTMLInputElement>(null);
	const brightnessInputRef = useRef<HTMLInputElement>(null);

	const onInputChange = () => {
		const newSettings: SettingsValues = {
			waveStyle: (waveInputRef.current?.value as keyof typeof waveStyles) ?? defaultSettings.waveStyle,
			blendMode: (blendInputRef.current?.value as keyof typeof blendModes) ?? defaultSettings.blendMode,
			colourScheme: (colourInputRef.current?.value as keyof typeof colourLabels) ?? defaultSettings.colourScheme,

			verticalCenter:
				centerInputRef.current?.value != null
					? Number.parseFloat(centerInputRef.current?.value)
					: defaultSettings.verticalCenter,
			magnitude:
				magnitudeInputRef.current?.value != null
					? Number.parseFloat(magnitudeInputRef.current?.value)
					: defaultSettings.verticalCenter,
			contrast:
				contrastInputRef.current?.value != null
					? Number.parseFloat(contrastInputRef.current?.value)
					: defaultSettings.contrast,
			brightness:
				brightnessInputRef.current?.value != null
					? Number.parseFloat(brightnessInputRef.current?.value)
					: defaultSettings.brightness,
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

			<label className='Settings__Label' htmlFor='magnitude-slider'>
				Party magnitude:
			</label>
			<input
				className='Settings__Input'
				id='magnitude-slider'
				type='range'
				min='0'
				max='1.5'
				step='0.05'
				ref={magnitudeInputRef}
				defaultValue={defaultSettings.magnitude}
				onChange={onInputChange}
			/>

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

			<label className='Settings__Label' htmlFor='colour-select'>
				Rainbow colours:
			</label>
			{/* eslint-disable-next-line jsx-a11y/no-onchange */}
			<select className='Settings__Input' id='colour-select' ref={colourInputRef} onChange={onInputChange}>
				{Object.keys(colourLabels).map((key) => (
					<option key={key} value={key}>
						{colourLabels[key as keyof typeof colourLabels]}
					</option>
				))}
			</select>

			<label className='Settings__Label' htmlFor='contrast-slider'>
				Contrast:
			</label>
			<input
				className='Settings__Input'
				id='contrast-slider'
				type='range'
				min='-1'
				max='1'
				step='0.05'
				ref={contrastInputRef}
				defaultValue={defaultSettings.contrast}
				onChange={onInputChange}
			/>

			<label className='Settings__Label' htmlFor='brightness-slider'>
				Brightness:
			</label>
			<input
				className='Settings__Input'
				id='brightness-slider'
				type='range'
				min='0'
				max='2'
				step='0.05'
				ref={brightnessInputRef}
				defaultValue={defaultSettings.brightness}
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
