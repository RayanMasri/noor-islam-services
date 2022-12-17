// import React, { useRef, useEffect, useState } from 'react';
// import { TextField, Button, Divider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
// import { LoadingButton } from '@mui/lab';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import jsPDF from 'jspdf';
// import pdfBackground from '../../icons/background.png';
// import pdfBackgroundMinified from '../../icons/background-minified.png';
// import scissorsIcon from '../../icons/scissors.png';
// // import maarifLogo from './maarif-logo-160.png';
// import Header from '../../components/Header.js';
// import './Committee.css';
// import useUtilityHook from 'hooks/UtilityHook.jsx';

export default function useUtilityHook() {
	const isIDNumberValid = (national) => national.toString().match(/^\d+$/g) != null && national.length != 0;

	const getNullTheme = (extra) => {
		return createTheme(extra);
	};

	const getRTLFieldTheme = (extra) => {
		return createTheme({
			components: {
				MuiInputLabel: {
					styleOverrides: {
						root: {
							left: 'inherit',
							right: '1.75rem',
							transformOrigin: 'right',
						},
					},
				},
				MuiOutlinedInput: {
					styleOverrides: {
						notchedOutline: {
							textAlign: 'right',
						},
					},
				},
			},
			...extra,
		});
	};

	const loadImage = (source) => {
		return new Promise((resolve, reject) => {
			let image = new Image();
			image.onload = function (event) {
				resolve({
					image: image,
					width: this.width,
					height: this.height,
				});
			};
			image.src = source;
		});
	};

	const mergeAsObject = (keys, values) => {
		if (keys.length != values.length) return {};

		let object = {};

		for (let i = 0; i < keys.length; i++) {
			object[keys[i]] = values[i];
		}

		return object;
	};

	return {
		isIDNumberValid,
		getRTLFieldTheme,
		getNullTheme,
		loadImage,
		mergeAsObject,
	};
}
