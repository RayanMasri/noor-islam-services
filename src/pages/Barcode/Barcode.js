import React, { useRef, useEffect, useState } from 'react';
import { TextField, Button, Divider } from '@mui/material';
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

const DESIGN_CHOICES = {
	'original': 'أصلي',
	'basic': 'مبسط',
	// 'miniature': 'مصغر',
};

const FILE_TYPES = {
	'pdf': 'PDF مستند',
	'jpg': 'JPG صورة',
};

// TODO: download committe pdf document based on selected language

export default function Barcode() {
	const [state, _setState] = useState({
		field: '',
		error: null,
		loading: false,
		showReady: false,
		designOpen: false,
		// designChoice: 'original',
		designChoice: 'original',
		fileOpen: false,
		fileChoice: 'pdf',
	});
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const { isIDNumberValid, getRTLFieldTheme, loadImage } = useUtilityHook();

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
		if (event.target.value.trim() == '')
			return setState({
				...state,
				field: event.target.value,
			});

		if (event.target.value.length > 13 || !isIDNumberValid(event.target.value)) return;

		setState({
			...state,
			error: null,
			field: event.target.value,
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

	const getBarcodeDocumentedOriginal = async () => {
		let ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		// Add background image
		let background = await loadImage(bgOriginal);
		canvas.current.width = background.width;
		canvas.current.height = background.height;
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, background.width, background.height);
		ctx.fillStyle = 'black';
		ctx.drawImage(background.image, 0, 0, background.width, background.height);

		// Add identity number box
		ctx.strokeStyle = 'black';
		ctx.setLineDash([6]);
		ctx.strokeRect(526 - 40, 59, 40, 147);

		// Add rotated identity number
		ctx.save();
		ctx.font = 'normal 26px oldink';
		let width = ctx.measureText(state.field).width;
		ctx.translate(526 - 28, 59 + width / 2 + (147 - width) / 2);
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
		createBarcode(ctx, state.field, maxWidth, { x: 19 + (padding + Math.floor((maxWidth - barcodeWidth) / 2)), y: 275 }, false);

		// Paper cut dashed line indicators
		ctx.strokeStyle = '#8F8F8F';
		context.line(0, 313 + 18 * 2 + 24 / 2, ctx.canvas.width, 313 + 18 * 2 + 24 / 2, [10, 5]);
		context.line(508 + 18 * 2 + 24 / 2, 0, 508 + 18 * 2 + 24 / 2, ctx.canvas.height, [10, 5]);

		// Add paper cut scissor icon indicators
		let scissors = await loadImage(scissorsIcon);
		context.rotatedImage(scissors.image, 508 + 18 * 2 + 50, 313 + 18 * 2, 24, 24, 180);
		context.rotatedImage(scissors.image, 508 + 18 * 2 + 24, 313 + 18 * 2 + 50, 24, 24, 270);

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getBarcodeDocumentedBasic = async () => {
		let ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		// Add background image
		let background = await loadImage(bgBasic);
		canvas.current.width = background.width;
		canvas.current.height = background.height;
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, background.width, background.height);
		ctx.fillStyle = 'black';
		ctx.drawImage(background.image, 0, 0, background.width, background.height);

		// Create barcode strip
		let padding = 60; // extended barcode
		let maxWidth = 506 - padding * 2;
		let { width: barcodeWidth } = calculateClampedWidth(`*${state.field}*`, maxWidth);
		createBarcode(ctx, state.field, maxWidth, { x: 19 + (padding + Math.floor((maxWidth - barcodeWidth) / 2)), y: 107 }, true, {
			barHeight: 30,
			barSpacing: 3,
			lineWidth: 3,
			rectWidth: 9,
			spaceWidth: 6,
			textSpacing: 20,
		});

		// Paper cut dashed line indicators
		ctx.strokeStyle = '#8F8F8F';
		context.line(0, 185 + 18 * 2 + 24 / 2, ctx.canvas.width, 185 + 18 * 2 + 24 / 2, [10, 5]);
		context.line(506 + 18 * 2 + 24 / 2, 0, 506 + 18 * 2 + 24 / 2, ctx.canvas.height, [10, 5]);

		// Add paper cut scissor icon indicators
		let scissors = await loadImage(scissorsIcon);
		context.rotatedImage(scissors.image, 506 + 18 * 2 + 50, 185 + 18 * 2, 24, 24, 180);
		context.rotatedImage(scissors.image, 506 + 18 * 2 + 24, 185 + 18 * 2 + 50, 24, 24, 270);

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getBarcodeDocumented = async () => {
		let data;
		if (state.designChoice == 'original') {
			data = await getBarcodeDocumentedOriginal();
		} else {
			data = await getBarcodeDocumentedBasic();
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

	const createBarcode = (ctx, input, maxWidth, offset, label = true, settings = null) => {
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

		lineWidth *= percentage;
		rectWidth *= percentage;
		spaceWidth *= percentage;
		barSpacing *= percentage;

		let origin = 0;
		// let origin = padding + Math.floor((maxWidth - totalWidth) / 2);

		if (label) {
			ctx.font = 'normal 28px oldink';
			ctx.letterSpacing = '0px';
			let textWidth = ctx.measureText(input).width;
			ctx.letterSpacing = `${(totalWidth - textWidth) / (input.length - 1)}px`;
			textWidth = ctx.measureText(input).width;
			ctx.fillStyle = 'black';
			ctx.textBaseline = 'top';
			ctx.fillText(input, offset.x + (input.length == 1 ? totalWidth / 2 - textWidth / 2 : 0), offset.y);
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
		createBarcode(ctx, input, maxWidth, { x: padding + Math.floor((maxWidth - width) / 2), y: 7 });
		// The recommended minimum symbol height for manual scanning is 5.0 mm or 15 percent of the symbol width (excluding quiet zones), whichever is greater. The quiet zones must be at least 10X wide, where "X" is the current X dimension.
	};

	const onSave = () => {
		switch (state.fileChoice) {
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
	}, []);

	return (
		<ThemeProvider
			theme={getRTLFieldTheme({
				shadows: ['none'],
			})}
			// theme={theme}
		>
			<div
				style={{
					// display: 'none',
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
					<Header />
				</div>
				<div id='main'>
					<div id='top'>
						<div
							id='title'
							style={{
								marginBottom: '30px',
								wordBreak: 'break-word',
								width: '100%',
								textAlign: 'center',
								fontFamily: 'segoeui',
							}}
						>
							إعادة إنشاء باركود
						</div>
						<div id='interactables'>
							<LoadingButton
								id='main-button'
								loading={state.loading}
								variant='contained'
								style={{
									height: '62px',
									fontSize: '20px',
								}}
								onClick={onRequestSearch}
							>
								إعادة إنشاء
							</LoadingButton>

							<TextField
								ref={field}
								type='number'
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
								id='main-field'
								label='رقم الهوية'
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
								<Button className='select-button' variant='contained' onClick={() => setState({ ...state, designOpen: true })} ref={designButton}>
									<KeyboardArrowDownIcon />

									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
										}}
									>
										<span style={{ color: 'gray' }}>{DESIGN_CHOICES[state.designChoice]}</span>&nbsp;:نوع التصميم
									</div>
								</Button>
								<SelectMenu
									anchor={designButton.current}
									style={{
										width: '100%',
									}}
									open={state.designOpen}
									selected={state.designChoice}
									onClose={() => setState({ ...state, designOpen: false })}
									onChange={(id) => {
										setState({
											...state,
											designOpen: false,
											designChoice: id,
										});
									}}
									options={Object.entries(DESIGN_CHOICES).map(([key, value]) => {
										return {
											id: key,
											name: value,
										};
									})}
									MenuListSx={{
										border: '1px solid #b2b9bc',
										boxSizing: 'border-box',
									}}
									sx={{
										marginTop: '5px',
									}}
									dir='rtl'
								/>

								<Button className='select-button' variant='contained' onClick={() => setState({ ...state, fileOpen: true })} ref={fileButton}>
									<KeyboardArrowDownIcon />

									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
										}}
									>
										<span style={{ color: 'gray' }}>{FILE_TYPES[state.fileChoice]}</span>&nbsp;:نوع الملف
									</div>
								</Button>

								<SelectMenu
									anchor={fileButton.current}
									open={state.fileOpen}
									selected={state.fileChoice}
									onClose={() => setState({ ...state, fileOpen: false })}
									onChange={(id) => {
										setState({
											...state,
											fileOpen: false,
											fileChoice: id,
										});
									}}
									options={Object.entries(FILE_TYPES).map(([key, value]) => {
										return {
											id: key,
											name: value,
										};
									})}
									MenuListSx={{
										border: '1px solid #b2b9bc',
										boxSizing: 'border-box',
									}}
									sx={{
										marginTop: '5px',
									}}
									dir='rtl'
								/>

								<Button variant='contained' onClick={onSave} style={{ width: '100%' }} className='save-button'>
									حفظ
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
