import { useState } from 'react';

function makeKey(key: string) {
	return `partify:${key}`;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(makeKey(key));

			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			return initialValue;
		}
	});

	const setValue = (value: T) => {
		try {
			setStoredValue(value);
			window.localStorage.setItem(makeKey(key), JSON.stringify(value));
		} catch (error) {
			console.log(error);
		}
	};

	return [storedValue, setValue];
}
