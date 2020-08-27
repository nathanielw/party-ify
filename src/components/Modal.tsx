import React from 'react';
import FocusLock from 'react-focus-lock';

interface ModalChildProps {
	triggerClose: () => void;
}

interface ModalProps {
	children: (props: ModalChildProps) => React.ReactNode;
	isOpen: boolean;
	onClose: () => void;
}
export default function Modal(props: ModalProps): JSX.Element | null {
	if (!props.isOpen) {
		return null;
	}

	return (
		<FocusLock>
			<div className='Modal__Background'>
				<div className='Modal' role='dialog' aria-modal='true'>
					{props.children({ triggerClose: props.onClose })}
				</div>
			</div>
		</FocusLock>
	);
}
