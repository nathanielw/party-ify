import * as React from 'react';
import './styles/styles.scss';
import Intro from './components/Intro';
import Creator from './components/Creator';

export default function App(): JSX.Element {
	return (
		<>
			<Intro />

      <Creator />
		</>
	);
}
