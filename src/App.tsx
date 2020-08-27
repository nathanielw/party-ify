import React, { useState } from 'react';
import './styles/styles.scss';
import Intro from './components/Intro';
import Creator from './components/Creator';
import Modal from './components/Modal';
import { useLocalStorage } from './util/useLocalStorage';
import Footer from './components/Footer';

export default function App(): JSX.Element {
	const [hasSeenModal, setHasSeenModal] = useLocalStorage<boolean>('hasSeenModal', false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(!hasSeenModal);

	const handleModalClose = () => {
		setIsModalOpen(false);
		setHasSeenModal(true);
	};

	return (
		<>
			<main
				aria-hidden={isModalOpen ? 'true' : undefined}
				className={`App__Main ${isModalOpen ? 'App__Main--modalOpen' : ''}`}
			>
				<Intro />

				<Creator />

				<Footer />
			</main>

			<Modal onClose={handleModalClose} isOpen={isModalOpen}>
				{({ triggerClose }) => (
					<>
						<p className='Modal__Text'>Hello! this site contains animations with flashing colours.</p>
						<button className='Button Button--secondary' type='button' onClick={triggerClose}>
							OK, let me in
						</button>
					</>
				)}
			</Modal>
		</>
	);
}
