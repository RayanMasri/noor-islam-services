import React, { useState } from 'react';

let object = {
	language: 'ar',
};

const MainContext = React.createContext({
	main: object,
	setMain: (main) => {},
});

export function MainContextProvider(props) {
	const [main, setMain] = useState(object);

	return <MainContext.Provider value={{ main, setMain }}>{props.children}</MainContext.Provider>;
}

export const useMainContext = () => React.useContext(MainContext);
