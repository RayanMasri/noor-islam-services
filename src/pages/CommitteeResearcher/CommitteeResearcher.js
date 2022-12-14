import React, { useRef, useEffect, useState } from 'react';
import { TextField, Button, Divider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import jsPDF from 'jspdf';
import pdfBackground from '../../icons/background.png';
import pdfBackgroundMinified from '../../icons/background-minified.png';
import scissorsIcon from '../../icons/scissors.png';
// import maarifLogo from './maarif-logo-160.png';
import Header from '../../components/Header.js';
import './CommitteeResearcher.css';
import useUtilityHook from 'hooks/UtilityHook.jsx';
import CanvasContext from 'hooks/CanvasContext.js';

import SelectMenu from 'components/SelectMenu.js';

// const CANVAS_FONT_SIZE = 500;
// const CANVAS_FONT_SIZE = 20;
// const TABLE_OFFSET_X = 88;
// const TABLE_OFFSET_Y = 192.1;
// const TABLE_WIDTH = 420;
// const TABLE_RIGHT_PADDING = 10;
// const TABLE_ROW_SPACING = 15;
// const TABLE_TOP_PADDING = TABLE_ROW_SPACING / 2;
// const TABLE_COLUMN_SPACING = TABLE_RIGHT_PADDING;
// const TABLE_ROW_DIVIDER_PADDING = 3;

// const WEB_TABLE_COLUMN_SPACING = 6;
// const MINIFIER_VALUE = 0.28571428571;
const MINIFIER_VALUE = 0.42857142857;
const MINIFIED_PADDING = 20;
const MINIFIED_BOTTOM_PADDING = 10;
// const OFFSET = 2 * MINIFIER;
const OFFSET = 2;

const CANVAS_FONT_SIZE = 20 * OFFSET;
const TABLE_OFFSET_X = 88 * OFFSET;
const TABLE_OFFSET_Y = 212.1 * OFFSET;
// const TABLE_OFFSET_Y = 165.1 * OFFSET;
const TABLE_WIDTH = 420 * OFFSET;
const TABLE_RIGHT_PADDING = 10 * OFFSET;
const TABLE_ROW_SPACING = 15 * OFFSET;
const TABLE_TOP_PADDING = TABLE_ROW_SPACING / 2;
const TABLE_COLUMN_SPACING = TABLE_RIGHT_PADDING;
const TABLE_ROW_DIVIDER_PADDING = 3 * OFFSET;

const WEB_TABLE_COLUMN_SPACING = 6;
// { "committee": 1, "class": "الأول", "area": "1/2", "seat-number": 44001 },

const switches = {
	'seat-number': 'رقم الجلوس',
	class: 'الصف',
	area: 'المكان',
	committee: 'اللجنة',
	national: 'رقم الهوية',
};

const SIZE_CHOICES = {
	'normal': 'عادي',
	'miniature': 'مصغر',
};

const FILE_TYPES = {
	'pdf': 'PDF مستند',
	'jpg': 'JPG صورة',
};

// TODO: download committe pdf document based on selected language

export default function CommitteeResearcher() {
	const [state, _setState] = useState({
		error: null,
		field: '',
		info: null,
		loading: false,
		anchor: null,
		sizeOpen: false,
		sizeChoice: 'normal',
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
	const download = useRef(null);

	const sizeButton = useRef(null);
	const fileButton = useRef(null);

	const onBlur = (event) => {
		if (!event.relatedTarget) return;

		if (event.relatedTarget.id == 'main-button') {
			setTimeout(function () {
				event.target.focus();
			}, 20);
		}
	};

	const measureText = (text, font) => {
		let context = canvas.current.getContext('2d');
		let oldFont = context.font;

		context.font = font;
		let measured = context.measureText(text);
		context.font = oldFont;

		return measured.width;
	};

	const handleClose = () => {
		setState({
			...state,
			anchor: null,
		});
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
		// Test ID number for google
		if (state.field == 123) {
			setState({
				...state,
				info: {
					national: 123,
					committee: 10,
					class: 'ثالث ثانوي',
					area: '1/1',
					'seat-number': 50000,
				},
			});
			return;
		}

		if (!isIDNumberValid(state.field)) {
			return setState({
				..._state.current,
				info: null,
				error: 'حدث خطأ ما',
			});
		}

		const national = state.field;

		setState({
			..._state.current,
			loading: true,
			info: null,
			error: null,
		});

		// try {
		// .then((response) => {
		// 	if (response.status >= 400 && response.status < 600) {
		// 	  throw new Error("Bad response from server");
		// 	}
		// 	return response;
		// }).then((returnedResponse) => {
		//    // Your response to manipulate
		//    this.setState({
		// 	 complete: true
		//    });
		// }).catch((error) => {
		//   // Your error is here!
		//   console.log(error)
		// });

		let result = await fetch('/search', {
			// let result = await fetch('http://localhost:3001/search', {
			body: JSON.stringify({
				national: national,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		})
			.then((response) => {
				if (response.status >= 400 && response.status < 600) {
					setState({
						...state,
						loading: false,
						info: null,
						error: 'فشل الوصول إلى الخادم',
					});
					// throw new Error("Bad response from server");
				} else {
					return response;
				}
			})
			.catch((error) => {
				setState({
					...state,
					loading: false,
					info: null,
					error: error.toString(),
				});
			});

		if (result == undefined) return;

		console.log(result.headers);

		let json = await result.json();
		// } catch (error) {
		// 	return setState({
		// 		...state,
		// 		loading: false,
		// 		info: null,
		// 		error: error.toString(),
		// 	});
		// }

		if (json.error)
			return setState({
				..._state.current,
				loading: false,
				info: null,
				error: json.reason,
			});

		delete json.error;

		let keyValues = Object.entries(json);
		keyValues.splice(0, 0, ['national', national]);
		json = Object.fromEntries(keyValues);

		setState({
			..._state.current,
			loading: false,
			error: null,
			info: json,
		});
	};

	const organizeInfo = () => {
		let texts = [];
		for (let [key, value] of Object.entries(state.info)) {
			texts.push({
				name: switches[key],
				value: value,
			});
		}
		return texts;
	};

	const getInfoAsBase64 = async (minifier = 1, backgroundImage = null, settings = null) => {
		let {
			canvas_font_size,
			table_row_spacing,
			table_top_padding,
			table_row_divider_padding,
			table_offset_x,
			table_offset_y,
			table_width,
			table_right_padding,
			table_column_spacing,
			minified_padding,
			minified_bottom_padding,
		} = settings || {
			'canvas_font_size': CANVAS_FONT_SIZE,
			'table_offset_x': TABLE_OFFSET_X,
			'table_offset_y': TABLE_OFFSET_Y,
			'table_width': TABLE_WIDTH,
			'table_right_padding': TABLE_RIGHT_PADDING,
			'table_row_spacing': TABLE_ROW_SPACING,
			'table_top_padding': TABLE_TOP_PADDING,
			'table_column_spacing': TABLE_COLUMN_SPACING,
			'table_row_divider_padding': TABLE_ROW_DIVIDER_PADDING,
			'minified_padding': 0,
			'minified_bottom_padding': 0,
		};

		var ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		let texts = organizeInfo();

		let background = await loadImage(backgroundImage || pdfBackground);

		canvas.current.width = background.width;
		canvas.current.height = background.height;
		// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, background.width, background.height);
		ctx.fillStyle = 'black';
		ctx.drawImage(background.image, 0, 0, background.width, background.height);

		// ctx.strokeStyle = '#8F8F8F';
		ctx.strokeStyle = 'black';

		const tableHeight = canvas_font_size + (texts.length - 1) * (canvas_font_size + table_row_spacing) + table_top_padding + table_row_spacing / 2 + table_row_divider_padding;
		context.line(table_offset_x, table_offset_y, table_offset_x + table_width, table_offset_y);
		context.line(table_offset_x + table_width, table_offset_y, table_offset_x + table_width, table_offset_y + tableHeight);
		ctx.font = `${canvas_font_size}px Arial`;

		let maxWidth = texts.map(({ name, value }) => ctx.measureText(name).width).sort((a, b) => b - a)[0];

		for (let i = 0; i < texts.length; i++) {
			let text = texts[i];
			let { name, value } = text;

			ctx.font = `${canvas_font_size}px Arial`;

			ctx.fillText(
				name,
				table_offset_x + table_width - ctx.measureText(name).width - table_right_padding,
				canvas_font_size + table_offset_y + i * (canvas_font_size + table_row_spacing) + table_top_padding
			);

			let y = canvas_font_size + table_offset_y + i * (canvas_font_size + table_row_spacing) + table_top_padding + table_row_spacing / 2 + table_row_divider_padding;

			context.line(table_offset_x, y, table_offset_x + table_width, y);

			ctx.fillText(
				value,
				table_offset_x + table_width - ctx.measureText(value).width - table_right_padding * 2 - maxWidth - table_column_spacing,
				canvas_font_size + table_offset_y + i * (canvas_font_size + table_row_spacing) + table_top_padding
			);
		}

		context.line(
			table_offset_x + table_width - maxWidth - table_right_padding - table_column_spacing,
			table_offset_y,
			table_offset_x + table_width - maxWidth - table_right_padding - table_column_spacing,
			table_offset_y + tableHeight
		);

		context.line(table_offset_x, table_offset_y, table_offset_x, table_offset_y + tableHeight);

		let warning = 'احذر كتابة اسمك ، هويتك الوطنية سرية';
		// ctx.font = `60px custom-arabic`;
		ctx.font = `${60 * minifier}px custom-arabic`;

		// Add scissors and dashed line
		// ctx.fillText(warning, ctx.canvas.width / 2 - ctx.measureText(warning).width / 2, table_offset_y + tableHeight + 30 * 2 + 65);
		ctx.fillText(warning, (ctx.canvas.width * minifier) / 2 - ctx.measureText(warning).width / 2 + minified_padding, table_offset_y + tableHeight + (30 * 2 + 65) * minifier);
		context.line(minified_padding, table_offset_y + tableHeight + 30 * 2 * minifier, ctx.canvas.width * minifier + minified_padding, table_offset_y + tableHeight + 30 * 2 * minifier);
		ctx.strokeStyle = '#8F8F8F';

		context.line(
			0,
			table_offset_y + tableHeight + (30 * 2 + 100) * minifier + minified_padding - minified_bottom_padding,
			ctx.canvas.width,
			table_offset_y + tableHeight + (30 * 2 + 100) * minifier + minified_padding - minified_bottom_padding,
			[10 * minifier, 5 * minifier]
		);
		context.line(ctx.canvas.width * minifier + minified_padding * 2, 0, ctx.canvas.width * minifier + minified_padding * 2, ctx.canvas.height, [10 * minifier, 5 * minifier]);

		let scissors = await loadImage(scissorsIcon);
		let size = 32 * minifier;
		if (minifier != 1) {
			// const drawRotatedImage = (ctx, image, x, y, width, height, angle) => {
			// ctx.drawImage(scissors.image, 50 * minifier, table_offset_y + tableHeight + (30 * 2 + 100) * minifier - size / 2, size, size);
			context.rotatedImage(
				scissors.image,
				(ctx.canvas.width + 50) * minifier + minified_padding * 2,
				table_offset_y + tableHeight + (30 * 2 + 100) * minifier - size / 2 + minified_padding - minified_bottom_padding,
				size,
				size,
				180
			);
			context.rotatedImage(
				scissors.image,
				ctx.canvas.width * minifier + size / 2 + minified_padding * 2,
				table_offset_y + tableHeight + (30 * 2 + 166) * minifier - size / 2 + minified_padding - minified_bottom_padding,
				size,
				size,
				270
			);
		} else {
			ctx.drawImage(scissors.image, 50 * minifier, table_offset_y + tableHeight + (30 * 2 + 100) * minifier - size / 2, size, size);
		}
		// if(minifier)

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getScaledInfo = async (minified = false) => {
		return await getInfoAsBase64(
			minified ? MINIFIER_VALUE : 1,
			minified ? pdfBackgroundMinified : pdfBackground,
			minified
				? {
						canvas_font_size: 20 * OFFSET * MINIFIER_VALUE,
						table_offset_x: (88 + MINIFIED_PADDING) * OFFSET * MINIFIER_VALUE,
						table_offset_y: (165.1 + MINIFIED_PADDING) * OFFSET * MINIFIER_VALUE,
						table_width: 420 * OFFSET * MINIFIER_VALUE,
						table_right_padding: 10 * OFFSET * MINIFIER_VALUE,
						table_row_spacing: 15 * OFFSET * MINIFIER_VALUE,
						table_top_padding: (TABLE_ROW_SPACING / 2) * MINIFIER_VALUE,
						table_column_spacing: TABLE_RIGHT_PADDING * MINIFIER_VALUE,
						table_row_divider_padding: 3 * OFFSET * MINIFIER_VALUE,
						minified_padding: MINIFIED_PADDING,
						minified_bottom_padding: MINIFIED_BOTTOM_PADDING,
				  }
				: null
		);
	};

	const scaleDimensionsTo = (dimensions, newWidth) => {
		let { width, height } = dimensions;
		let ratio = width / newWidth;
		return {
			width: width / ratio,
			height: height / ratio,
		};
	};

	const saveAsPhoto = async (minified = false) => {
		let data = await getScaledInfo(minified);
		download.current.href = data;
		download.current.click();
	};

	const saveAsDocument = async (minified = false) => {
		let data = await getScaledInfo(minified);
		let image = scaleDimensionsTo(await getImageDimensions(data), 210);

		pdf.addImage(data, 0, 0, image.width, image.height);
		pdf.save('اللجنة');
	};

	const getImageDimensions = (base64) => {
		return new Promise((resolve, reject) => {
			let image = document.createElement('img');
			image.onload = function () {
				resolve({
					width: this.width,
					height: this.height,
				});
				image.remove();
			};
			image.src = base64;
		});
	};

	const onSave = (event) => {
		// console.log('save');

		switch (state.fileChoice) {
			case 'pdf':
				saveAsDocument(state.sizeChoice == 'miniature');
				break;
			case 'jpg':
				saveAsPhoto(state.sizeChoice == 'miniature');
				break;
		}

		// setState({
		// ...state,
		// anchor: event.currentTarget,
		// });
	};

	useEffect(() => {
		// Load custom-arabic
		let ctx = canvas.current.getContext('2d');
		ctx.font = 'normal 18px custom-arabic';
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
				<a ref={download} download='اللجنة.jpeg' />
			</div>

			<div id='committee-researcher-page' className='App page'>
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
							ابحث عن معلومات اللجنة
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
								ابحث
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

						{state.info && (
							<div
								id='info-area'
								style={{
									display: 'flex',
									flexDirection: 'column',
									marginTop: '10px',
								}}
							>
								<div
									style={{
										border: '1px solid #C4C4C4',
										borderRadius: '5px',
										fontSize: '18px',
										// paddingRight: '10px',
										marginBottom: '10px',
									}}
								>
									{Object.entries(state.info).map(([key, value], index) => {
										let maximum = Object.keys(state.info)
											.map((key) => measureText(switches[key], '18px custom-arabic'))
											.sort((a, b) => b - a)[0];

										let self = measureText(switches[key], '18px custom-arabic');

										return (
											<div
												key={`info-item-${index}`}
												style={{
													width: '100%',
												}}
											>
												<div
													style={{
														display: 'flex',
														flexDirection: 'row',
														width: '100%',
														justifyContent: 'flex-start',
														paddingRight: '10px',
														boxSizing: 'border-box',
													}}
												>
													<div
														style={{
															display: 'flex',
															alignItems: 'center',
															textAlign: 'center',
															wordBreak: 'break-word',
															flexDirection: 'row-reverse',
															width: '100%',
															fontFamily: 'custom-arabic',
														}}
													>
														{switches[key]}
														<Divider
															style={{
																height: '100%',
																backgroundColor: '#C4C4C4',
																marginLeft: `${WEB_TABLE_COLUMN_SPACING}px`,
																marginRight: `${maximum - self + WEB_TABLE_COLUMN_SPACING}px`,
															}}
															orientation='vertical'
														/>
														<span style={{ fontFamily: 'Arial' }}>{value}</span>
													</div>
												</div>
												{index != Object.keys(state.info).length - 1 && <Divider style={{ width: '100%', backgroundColor: '#C4C4C4' }} />}
											</div>
										);
									})}
								</div>

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
									<Button className='select-button' variant='contained' onClick={() => setState({ ...state, sizeOpen: true })} ref={sizeButton}>
										<KeyboardArrowDownIcon />

										<div
											style={{
												display: 'flex',
												flexDirection: 'row',
											}}
										>
											<span style={{ color: 'gray' }}>{SIZE_CHOICES[state.sizeChoice]}</span>&nbsp;:نوع التصميم
										</div>
									</Button>
									<SelectMenu
										anchor={sizeButton.current}
										style={{
											width: '100%',
										}}
										open={state.sizeOpen}
										selected={state.sizeChoice}
										onClose={() => setState({ ...state, sizeOpen: false })}
										onChange={(id) => {
											setState({
												...state,
												sizeOpen: false,
												sizeChoice: id,
											});
										}}
										options={Object.entries(SIZE_CHOICES).map(([key, value]) => {
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

									<Button variant='contained' onClick={onSave} style={{ width: '100%' }}>
										حفظ
									</Button>

									<Menu
										anchorEl={state.anchor}
										open={state.anchor != null}
										onClose={handleClose}
										sx={{
											marginTop: '2px',
										}}
										MenuListProps={{
											sx: {
												backgroundColor: '#1976D2',
												width: '140px',
												color: 'white',
											},
										}}
									>
										<MenuItem
											onClick={() => {
												saveAsDocument(true);
												handleClose();
											}}
										>
											PDF&nbsp;<span>كمستند مصغر</span>
										</MenuItem>
										<MenuItem
											onClick={() => {
												saveAsDocument();
												handleClose();
											}}
										>
											PDF&nbsp;<span>كمستند</span>
										</MenuItem>
										<MenuItem
											onClick={() => {
												saveAsPhoto();
												handleClose();
											}}
										>
											JPG&nbsp;<span>كصورة</span>
										</MenuItem>
									</Menu>
								</div>
							</div>
						)}
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
				Test number: 123
			</div>
		</ThemeProvider>
	);
}
