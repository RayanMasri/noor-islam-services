import React from 'react';
import ReactDOM from 'react-dom/client';
import 'index.css';
import App from 'App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';
// import RTL from './RTL.js';
import CommitteeResearcher from 'pages/CommitteeResearcher/CommitteeResearcher.js';
import CommitteeList from 'pages/CommitteeList/CommitteeList.js';
import Barcode from 'pages/Barcode/Barcode.js';
import Schedule from 'pages/Schedule/Schedule.js';
import { MainContextProvider } from 'contexts/MainContext.jsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
	},
	{
		path: '/committee-researcher',
		element: <CommitteeResearcher />,
	},
	{
		path: '/committee-list',
		element: <CommitteeList />,
	},
	{
		path: '/barcode',
		element: <Barcode />,
	},
	{
		path: '/schedule',
		element: <Schedule />,
	},
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<MainContextProvider>
		<RouterProvider router={router} />
	</MainContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
