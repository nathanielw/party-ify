import React from 'react';
export default function Footer(): JSX.Element {
	return (
		<footer className='Footer'>
			<p className='Footer__Paragraph'>
				* None of this is true. not associated with Slack, can bring the party anywhere that supports custom emoji (MS
				Teams, you make it hard to love you). Inspired by{' '}
				<a href='https://cultofthepartyparrot.com/'>Cult of the Party Parrot</a>
			</p>
			<p className='Footer__Paragraph'>
				made with <img src={`${process.env.PUBLIC_URL}/heart.gif`} alt='love' className='Footer__Icon' /> by{' '}
				<a href='https://twitter.com/Nathanielnw'>Nate Watson</a>
			</p>
		</footer>
	);
}
