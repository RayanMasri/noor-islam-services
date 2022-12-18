import React, { useRef, useEffect, useState } from 'react';
import { TextField, Button, Divider, Slider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import Menu from '@mui/material/Menu';
import SelectMenu from 'components/SelectMenu.js';

import MenuItem from '@mui/material/MenuItem';
import jsPDF from 'jspdf';
import pdfBackground from '../../icons/background.png';
import pdfBackgroundMinified from '../../icons/background-minified.png';
import scissorsIcon from '../../icons/scissors.png';
// import maarifLogo from './maarif-logo-160.png';
import Header from '../../components/Header.js';
import Menu from 'components/Menu.js';

import './Barcode.css';
import useUtilityHook from 'hooks/UtilityHook.jsx';
import CanvasContext from 'hooks/CanvasContext.js';

import bgOriginal from 'icons/barcode-background-original.png';
import bgBasic from 'icons/barcode-background-basic.png';
import bgOriginalEn from 'icons/barcode-background-original-en.png';
import bgBasicEn from 'icons/barcode-background-basic-en.png';
// import bgBasic from 'icons/barcode-background-basic.png';

import useLocaleHook from 'hooks/LocaleHook.js';
import useDateHook from 'hooks/DateHook.jsx';
import { useMainContext } from 'contexts/MainContext.jsx';

import ChoiceField from './ChoiceField.js';

// import Barcode from 'react-jsbarcode';
// import JsBarcode from 'jsbarcode';

// TODO: add design choice for book sticker or card
// TODO: when saving pdf or jpg of document or barcode, change name and add a prefix/postfix

const dictionary = {
	// L -> Line, S -> Space, R -> Rectangle
	'*': ['l', 's', 'l', 'r', 'r', 'l'],
	'0': ['l', 'l', 's', 'r', 'r', 'l'],
	'1': ['r', 'l', 's', 'l', 'l', 'r'],
	'2': ['l', 'r', 's', 'l', 'l', 'r'],
	'3': ['r', 'r', 's', 'l', 'l', 'l'],
	'4': ['l', 'l', 's', 'r', 'l', 'r'],
	'5': ['r', 'l', 's', 'r', 'l', 'l'],
	'6': ['l', 'r', 's', 'r', 'l', 'l'],
	'7': ['l', 'l', 's', 'l', 'r', 'r'],
	'8': ['r', 'l', 's', 'l', 'r', 'l'],
	'9': ['l', 'r', 's', 'l', 'r', 'l'],

	// '2':
};

// TODO: download committe pdf document based on selected language

export default function Barcode() {
	const [state, _setState] = useState({
		field: '',
		error: null,
		loading: false,
		showReady: false,
		design: localStorage.getItem('barcode-design-choice-field') || 'original',
		file: localStorage.getItem('barcode-file-choice-field') || 'pdf',
		scale: 100,
	});
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const { main } = useMainContext();
	const { switchLocale, getLocaleKey } = useLocaleHook();

	const onLanguageChange = (lang) => {
		switchLocale(lang, '/barcode');
	};

	const { isIDNumberValid, getRTLFieldTheme, getNullTheme, loadImage, mergeAsObject } = useUtilityHook();
	const { isArabicDigit, fromArToEnInteger } = useDateHook();

	const pdf = new jsPDF();
	const field = useRef(null);
	const canvas = useRef(null);
	const showcaseCanvas = useRef(null);
	const download = useRef(null);
	const designButton = useRef(null);
	const fileButton = useRef(null);

	const onBlur = (event) => {
		if (!event.relatedTarget) return;

		if (event.relatedTarget.id == 'main-button') {
			setTimeout(function () {
				event.target.focus();
			}, 20);
		}
	};

	const onFieldChange = (event) => {
		let value = event.target.value
			.split('')
			.map((character) => (isArabicDigit(character) ? fromArToEnInteger(character) : character))
			.join('');

		if (value.trim() == '')
			return setState({
				...state,
				field: value,
			});

		if (value.length > 13 || !isIDNumberValid(value)) return;

		setState({
			...state,
			error: null,
			field: value,
		});
	};

	const onRequestSearch = async (event) => {
		if (!isIDNumberValid(state.field)) {
			return setState({
				..._state.current,
				error: 'حدث خطأ ما',
				showReady: false,
			});
		}

		setState({
			..._state.current,
			loading: true,
			error: null,
		});

		createShowcaseBarcode(state.field);

		setState({
			..._state.current,
			loading: false,
			error: null,
			showReady: true,
		});
	};

	const getWhiteImage = (width, height) => {
		let ctx = canvas.current.getContext('2d');

		canvas.current.width = width;
		canvas.current.height = height;
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getBarcodeDocumentedOriginal = async (direction = 'rtl', scale = 1) => {
		let ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		let extension = 1 / scale;

		// Add background image
		let background = await loadImage(direction == 'rtl' ? bgOriginal : bgOriginalEn);
		canvas.current.width = background.width;
		canvas.current.height = background.height;

		ctx.scale(scale, scale);

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, background.width * extension, background.height * extension);
		ctx.fillStyle = 'black';
		ctx.drawImage(background.image, 0, 0, background.width, background.height);

		// Add identity number box
		ctx.strokeStyle = 'black';
		ctx.setLineDash([6]);
		ctx.strokeRect(direction == 'rtl' ? 526 - 40 : 19, 59, 40, 147);

		// Add rotated identity number
		ctx.save();
		ctx.font = 'normal 26px oldink';
		let width = ctx.measureText(state.field).width;
		ctx.translate(direction == 'rtl' ? 526 - 28 : 19 + 13, 59 + width / 2 + (147 - width) / 2);
		ctx.rotate(90 * (Math.PI / 180));
		ctx.textAlign = 'center';
		ctx.fillStyle = 'black';
		ctx.lineSpacing = '0px';
		ctx.fillText(state.field, 0, 0);
		ctx.restore();

		// Create barcode strip
		let padding = 86;
		let maxWidth = 508 - padding * 2;
		let { width: barcodeWidth } = calculateClampedWidth(`*${state.field}*`, maxWidth);
		createBarcode(ctx, state.field, maxWidth, { x: 19 + (padding + Math.floor((maxWidth - barcodeWidth) / 2)), y: 275 }, false, canvas);

		// Paper cut dashed line indicators
		ctx.strokeStyle = '#8F8F8F';
		context.line(0, 313 + 18 * 2 + 24 / 2, ctx.canvas.width * extension, 313 + 18 * 2 + 24 / 2, [10, 5]);
		context.line(508 + 18 * 2 + 24 / 2, 0, 508 + 18 * 2 + 24 / 2, ctx.canvas.height * extension, [10, 5]);

		// Add paper cut scissor icon indicators
		let scissors = await loadImage(scissorsIcon);
		context.rotatedImage(scissors.image, 508 + 18 * 2 + 50, 313 + 18 * 2, 24, 24, 180);
		context.rotatedImage(scissors.image, 508 + 18 * 2 + 24, 313 + 18 * 2 + 50, 24, 24, 270);

		// ctx.scale(2, 2);

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getBarcodeDocumentedBasic = async (direction = 'rtl', scale = 1) => {
		let ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		let extension = 1 / scale;

		// Add background image
		let background = await loadImage(direction == 'rtl' ? bgBasic : bgBasicEn);
		canvas.current.width = background.width;
		canvas.current.height = background.height;

		ctx.scale(scale, scale);

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, background.width * extension, background.height * extension);
		ctx.fillStyle = 'black';
		ctx.drawImage(background.image, 0, 0, background.width, background.height);

		// Create barcode strip
		let padding = 60; // extended barcode
		let maxWidth = 506 - padding * 2;
		let { width: barcodeWidth } = calculateClampedWidth(`*${state.field}*`, maxWidth);
		createBarcode(
			ctx,
			state.field,
			maxWidth,
			{ x: 19 + (padding + Math.floor((maxWidth - barcodeWidth) / 2)), y: 107 },
			true,
			{
				barHeight: 30,
				barSpacing: 3,
				lineWidth: 3,
				rectWidth: 9,
				spaceWidth: 6,
				textSpacing: 20,
			},
			canvas
		);

		// Paper cut dashed line indicators
		ctx.strokeStyle = '#8F8F8F';
		context.line(0, 185 + 18 * 2 + 24 / 2, ctx.canvas.width * extension, 185 + 18 * 2 + 24 / 2, [10, 5]);
		context.line(506 + 18 * 2 + 24 / 2, 0, 506 + 18 * 2 + 24 / 2, ctx.canvas.height * extension, [10, 5]);

		// Add paper cut scissor icon indicators
		let scissors = await loadImage(scissorsIcon);
		context.rotatedImage(scissors.image, 506 + 18 * 2 + 50, 185 + 18 * 2, 24, 24, 180);
		context.rotatedImage(scissors.image, 506 + 18 * 2 + 24, 185 + 18 * 2 + 50, 24, 24, 270);
		console.log(ctx);

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getBarcodeDocumented = async () => {
		let data;
		let direction = main.language == 'ar' ? 'rtl' : 'ltr';

		if (state.design == 'original') {
			data = await getBarcodeDocumentedOriginal(direction, state.scale / 100);
		} else {
			data = await getBarcodeDocumentedBasic(direction, state.scale / 100);
		}

		return data;
	};

	const scaleDimensionsTo = (dimensions, newWidth) => {
		let { width, height } = dimensions;
		let ratio = width / newWidth;
		return {
			width: width / ratio,
			height: height / ratio,
		};
	};

	const saveAsPhoto = async () => {
		let data = await getBarcodeDocumented();

		download.current.href = data;
		download.current.click();
	};

	const saveAsDocument = async () => {
		let data = await getBarcodeDocumented();
		let image = scaleDimensionsTo(await loadImage(data), 210);

		pdf.addImage(data, 0, 0, image.width, image.height);
		pdf.save('الباركود');
	};

	const calculateTotalWidth = (string, lineWidth, rectWidth, spaceWidth, barSpacing) => {
		const widthDictionary = {
			'l': lineWidth,
			'r': rectWidth,
			's': spaceWidth - barSpacing, // spaces dont produce bar spacing, only rectangles and lines
		};

		// if exceeds canvas width, keep calculating width whiel decreasing widths and spacings until the correct width is reached
		let totalWidth = 0;
		let totalBars = string.length * 6;
		for (let character of string) {
			for (let bar of dictionary[character]) {
				totalWidth += widthDictionary[bar];
			}
		}

		totalWidth += (totalBars - 1) * barSpacing;

		return totalWidth;
	};

	const calculateClampedWidth = (string, maxWidth, lineWidth = 3, rectWidth = 9, spaceWidth = 6, barSpacing = 3) => {
		let totalWidth = calculateTotalWidth(string, lineWidth, rectWidth, spaceWidth, barSpacing);

		let percentage = 1;

		if (totalWidth > maxWidth) {
			percentage = maxWidth / totalWidth;
			// lineWidth *= maxWidth / totalWidth;
			// rectWidth *= maxWidth / totalWidth;
			// spaceWidth *= maxWidth / totalWidth;
			// barSpacing *= maxWidth / totalWidth;

			// totalWidth = calculateTotalWidth(string, lineWidth, rectWidth, spaceWidth, barSpacing);
		}

		return { width: calculateTotalWidth(string, lineWidth * percentage, rectWidth * percentage, spaceWidth * percentage, barSpacing * percentage), percentage: percentage };
	};

	const createBarcode = (ctx, input, maxWidth, offset, label = true, settings = null, canvasRef = null) => {
		let context = new CanvasContext(ctx);

		let barHeight = 30;
		let barSpacing = 3; // = line width
		let lineWidth = 3;
		let rectWidth = 9; // 3x line width
		let spaceWidth = 6; // 2x line width
		let textSpacing = 10;

		if (settings) {
			[barHeight, barSpacing, lineWidth, rectWidth, spaceWidth, textSpacing] = Object.values(settings);
		}

		const createBar = (position, size, color) => {
			ctx.lineWidth = size;
			ctx.strokeStyle = color;
			let labelOffset = label ? 28 + textSpacing : 0;
			// context.line(position + size / 2, showcaseCanvas.current.height - bottomPadding - barHeight, position + size / 2, showcaseCanvas.current.height - bottomPadding);
			context.line(offset.x + position + size / 2, labelOffset + offset.y, offset.x + position + size / 2, labelOffset + offset.y + barHeight);
		};

		const string = `*${input}*`;

		let { width: totalWidth, percentage } = calculateClampedWidth(string, maxWidth, lineWidth, rectWidth, spaceWidth, barSpacing);
		console.log(`Barcode width: ${totalWidth}`);

		lineWidth *= percentage;
		rectWidth *= percentage;
		spaceWidth *= percentage;
		barSpacing *= percentage;

		let origin = 0;
		// let origin = padding + Math.floor((maxWidth - totalWidth) / 2);

		// TODO: fill each character as a text
		if (label) {
			ctx.font = 'normal 28px oldink';

			let textWidth = input
				.split('')
				.map((character) => ctx.measureText(character).width)
				.reduce((acc, val) => acc + val);

			let letterSpacing = (totalWidth - textWidth) / (input.length - 1);

			ctx.fillStyle = 'black';
			ctx.textBaseline = 'top';

			if (input.length == 1) {
				ctx.fillText(input, offset.x + totalWidth / 2 - textWidth / 2, offset.y);
			} else {
				let origin = 0;
				for (let character of input) {
					ctx.fillText(character, origin + offset.x, offset.y);
					origin += ctx.measureText(character).width;
					origin += letterSpacing;
				}
			}

			// ctx.letterSpacing = letterSpacing;

			// textWidth = ctx.measureText(input).width;
			// console.log(textWidth);
			// ctx.fillStyle = 'black';
			// ctx.textBaseline = 'top';
			// ctx.fillText(input, offset.x + (input.length == 1 ? totalWidth / 2 - textWidth / 2 : 0), offset.y);
		}

		// console.log(totalWidth);

		for (let character of string) {
			let instructions = dictionary[character];
			let previous_width = 0;
			for (let step of instructions) {
				switch (step) {
					case 'l':
						origin += previous_width;
						createBar(origin, lineWidth);
						previous_width = lineWidth + barSpacing; // spacing;
						break;
					case 's':
						// origin += spaceWidth - barSpacing;
						origin += spaceWidth;
						break;
					case 'r':
						origin += previous_width;
						createBar(origin, rectWidth);
						previous_width = rectWidth + barSpacing; // spacing;
						break;
				}
			}
			origin += previous_width;
		}
	};

	const createShowcaseBarcode = (input) => {
		let ctx = showcaseCanvas.current.getContext('2d');

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, showcaseCanvas.current.width, showcaseCanvas.current.height);

		let padding = 16;
		let maxWidth = showcaseCanvas.current.width - padding * 2;
		let { width } = calculateClampedWidth(`*${input}*`, maxWidth);
		createBarcode(ctx, input, maxWidth, { x: padding + Math.floor((maxWidth - width) / 2), y: 7 }, true, null, showcaseCanvas);
		// The recommended minimum symbol height for manual scanning is 5.0 mm or 15 percent of the symbol width (excluding quiet zones), whichever is greater. The quiet zones must be at least 10X wide, where "X" is the current X dimension.
	};

	const onSave = () => {
		switch (state.file) {
			case 'pdf':
				saveAsDocument();
				break;
			case 'jpg':
				saveAsPhoto();
				break;
		}
	};

	useEffect(() => {
		// Load oldink
		let ctx = canvas.current.getContext('2d');
		ctx.font = 'normal 40px oldink';
		ctx.fillStyle = 'black';
		ctx.fillText('123', 50, 50);
		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
		switchLocale(main.language, '/barcode');
	}, []);

	return (
		<ThemeProvider
			theme={
				main.language == 'ar'
					? getRTLFieldTheme({
							shadows: ['none'],
					  })
					: getNullTheme({ shadows: ['none'] })
			}
			// theme={theme}
		>
			<div
				style={{
					display: 'none',
					position: 'fixed',
					overflow: 'hidden',
					// height: 'max-content',
					// width: `${(localStorage.getItem('js-pdf-page-width') || defaultPageWidth) * ratio}px`,
					// width: 'max-content',
					// right: '-100%',
					fontFamily: 'custom-arabic',
				}}
			>
				<canvas ref={canvas} width='400' height='150'></canvas>

				{/* <canvas ref={canvas} width='1920' height='150' style={{ margin: '15px 0px 0px 15px', backgroundColor: 'white' }}></canvas> */}
				<a ref={download} download='اللجنة.jpeg' />
			</div>

			<div
				id='barcode-page'
				className='App page'
				style={{
					zIndex: '-10',
				}}
			>
				<div style={{ width: '100%', paddingLeft: '3.125vw', paddingRight: '3.125vw', boxSizing: 'border-box', zIndex: '5' }}>
					<Header onLanguageChange={onLanguageChange} />
				</div>
				<div id='main'>
					<div id='top'>
						<div
							data-locale-key='title'
							id='title'
							style={{
								marginBottom: '30px',
								wordBreak: 'break-word',
								width: '100%',
								textAlign: 'center',
								fontFamily: 'segoeui',
							}}
						></div>

						<div className={`interactables${main.language == 'en' ? ' interactables-en' : ''}`}>
							<LoadingButton
								className={`main-button${main.language == 'en' ? ' main-button-en' : ''}`}
								loading={state.loading}
								variant='contained'
								style={{
									height: '62px',
									fontSize: '20px',
									textTransform: 'none',
								}}
								onClick={onRequestSearch}
							>
								<div data-locale-key='regenerate-btn'>إعادة إنشاء</div>
							</LoadingButton>

							<TextField
								ref={field}
								style={{
									textAlign: 'right',
								}}
								sx={{
									width: '100%',
									height: '62px',
									textAlign: 'right',
								}}
								InputLabelProps={{
									// shrink: true,
									sx: {
										fontSize: '20px',
									},
								}}
								InputProps={{
									sx: {
										fontSize: '20px',
										height: '62px',
									},
								}}
								inputProps={{
									style: { textAlign: main.language == 'ar' ? 'right' : 'left' },
								}}
								id='main-field'
								label={getLocaleKey(main.language, '/barcode', 'field-label')}
								value={state.field}
								onChange={onFieldChange}
								onBlur={onBlur}
								onKeyDown={(event) => {
									if (event.keyCode == 13) {
										onRequestSearch();
									}
								}}
							/>

							{/* <Button
								id='main-button'
								variant='contained'
								style={{
									height: '62px',
									width: '150px',
									fontSize: '25px',
								}}
								onClick={onRequestSearch}
							>
								البحث
							</Button> */}

							{/* <button id='main-button'>البحث</button> */}

							{/* <input type='number' id='main-field' placeholder='رقم الهوية' /> */}
						</div>

						<div
							id='error'
							style={{
								display: state.error ? 'flex' : 'none',

								color: 'red',
								// whiteSpace: 'nowrap',
								// overflow: 'hidden',
								// textOverflow: 'ellipsis?',
								wordBreak: 'break-word',
								fontSize: '18px',
								justifyContent: 'flex-end',
							}}
						>
							{state.error}
						</div>

						<div
							id='info-area'
							style={{
								display: state.showReady ? 'flex' : 'none',
								flexDirection: 'column',
								marginTop: '10px',
							}}
						>
							<canvas
								ref={showcaseCanvas}
								height='84px'
								// height='160px'
								style={{
									backgroundColor: 'white',
									width: '100%',
									borderRadius: '4px',
									border: '1px solid #B2B9BC',
									marginBottom: '10px',
								}}
							></canvas>

							<div
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									flexDirection: 'column',
								}}
								id='interactable-buttons'
							>
								<ChoiceField
									choices={mergeAsObject(['original', 'basic'], getLocaleKey(main.language, '/barcode', 'design-field-choices'))}
									default='original'
									onChange={(id) => {
										setState({
											...state,
											design: id,
										});
									}}
									name={getLocaleKey(main.language, '/barcode', 'design-field-name')}
									language={main.language}
									id='barcode-design-choice-field'
								/>

								<ChoiceField
									choices={mergeAsObject(['pdf', 'jpg'], getLocaleKey(main.language, '/barcode', 'file-field-choices'))}
									default='pdf'
									onChange={(id) => {
										setState({
											...state,
											file: id,
										});
									}}
									name={getLocaleKey(main.language, '/barcode', 'file-field-name')}
									language={main.language}
									id='barcode-file-choice-field'
								/>

								<div
									className='option-box'
									style={{
										display: 'flex',
										flexDirection: main.language == 'ar' ? 'row-reverse' : 'row',
										alignItems: 'center',
										justifyContent: 'space-between',
										padding: '0px 10px 0px 10px',
									}}
								>
									<div
										data-locale-key='scale-slider'
										style={{
											direction: main.language == 'ar' ? 'rtl' : 'ltr',
											width: 'max-content',
											margin: main.language == 'ar' ? '0px 0px 0px 15px' : '0px 10px 0px 0px',
											whiteSpace: 'nowrap',
										}}
									>
										نسبة قياس الحجم:
									</div>
									<Slider
										sx={{
											width: '70%',
										}}
										size='small'
										max={200}
										value={state.scale}
										onChange={(event) => {
											setState({
												...state,
												scale: event.target.value,
											});
										}}
									/>
									<div style={{ margin: main.language == 'ar' ? '0px 10px 0px 0px' : '0px 0px 0px 15px', textAlign: 'left' }}>{state.scale}%</div>
								</div>

								<Button className='save-button' variant='contained' onClick={onSave} style={{ width: '100%', textTransform: 'none', display: 'flex', alignItems: 'center' }}>
									<div data-locale-key='save-button' style={{ lineHeight: '1em' }}>
										حفظ
									</div>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				style={{
					width: '100%',
					bottom: 0,
					left: 0,
					position: 'fixed',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					fontSize: '20px',
					marginBottom: '5px',
				}}
			>
				Test number: 1234567890
			</div>
		</ThemeProvider>
	);
}
