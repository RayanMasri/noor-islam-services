import React, { useRef, useEffect, useState } from 'react';
import { TextField, Button, Divider, Slider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';

import jsPDF from 'jspdf';
import scissorsIcon from '../../icons/scissors.png';
import Header from '../../components/Header.js';

import useUtilityHook from 'hooks/UtilityHook.jsx';
import useLocaleHook from 'hooks/LocaleHook.js';
import useDateHook from 'hooks/DateHook.jsx';

import CanvasContext from 'hooks/CanvasContext.js';
import { useMainContext } from 'contexts/MainContext.jsx';

import bgMinified from 'icons/background-minified.png';
import bgNormal from 'icons/background.png';

import ChoiceField from 'components/ChoiceField.js';

import './CommitteeResearcher.scss';

const WEB_TABLE_COLUMN_SPACING = 6;

const switchesAr = {
	'seat-number': 'رقم الجلوس',
	class: 'الصف',
	area: 'المكان',
	committee: 'اللجنة',
	national: 'رقم الهوية',
};
const switchesEn = {
	'seat-number': 'Seat Number',
	class: 'Class',
	area: 'Area',
	committee: 'Committee',
	national: 'Identity Number',
};

// TODO: download committe pdf document based on selected language

export default function Barcode() {
	const [state, _setState] = useState({
		field: '',
		error: null,
		info: null,
		infoEn: null,
		loading: false,
		showReady: false,
		design: localStorage.getItem('committee-researcher-design-choice-field') || 'normal',
		file: localStorage.getItem('committee-researcher-file-choice-field') || 'pdf',
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
		setState({
			...state,
			error: null,
		});
		switchLocale(lang, '/committee-researcher');
	};

	const { isIDNumberValid, getRTLFieldTheme, getNullTheme, loadImage, mergeAsObject } = useUtilityHook();
	const { isArabicDigit, fromArToEnInteger } = useDateHook();

	const pdf = new jsPDF();
	const field = useRef(null);
	const canvas = useRef(null);
	const download = useRef(null);

	const measureText = (text, font) => {
		let context = canvas.current.getContext('2d');
		let oldFont = context.font;

		context.font = font;
		let measured = context.measureText(text);
		context.font = oldFont;

		return measured.width;
	};

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
				infoEn: {
					national: 123,
					committee: 10,
					class: 'Third year',
					area: '1/1',
					'seat-number': 50000,
				},
				showReady: true,
			});
			return;
		}

		if (!isIDNumberValid(state.field)) {
			return setState({
				..._state.current,
				error: main.language == 'en' ? 'An error occured' : 'حدث خطأ ما',
				showReady: false,
			});
		}

		setState({
			..._state.current,
			loading: true,
			error: null,
		});

		let result = await fetch('/search', {
			body: JSON.stringify({ national: state.field }),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		})
			.then((response) => {
				if (response.status >= 400 && response.status < 600) {
					setState({
						...state,
						loading: false,
						error: main.language == 'en' ? 'Failed to reach server' : 'فشل الوصول إلى الخادم',
					});
					return undefined;
				}

				return response;
			})
			.catch((error) => {
				setState({
					...state,
					loading: false,
					error: error.toString(),
				});
			});

		if (result == undefined) return;

		let json = await result.json();

		if (json.error)
			return setState({
				..._state.current,
				loading: false,
				error: json.reason,
			});

		delete json.error;

		let keyValues = Object.entries(json);
		keyValues.splice(0, 0, ['national', state.field]);
		json = Object.fromEntries(keyValues);

		setState({
			..._state.current,
			loading: false,
			error: null,
			info: json,
			showReady: true,
		});
	};

	const scaleDimensionsTo = (dimensions, newWidth) => {
		let { width, height } = dimensions;
		let ratio = width / newWidth;
		return {
			width: width / ratio,
			height: height / ratio,
		};
	};

	const organizeInfo = () => {
		let texts = [];
		for (let [key, value] of Object.entries(state.info)) {
			texts.push({
				name: switchesAr[key],
				value: value,
			});
		}
		return texts;
	};

	const getCommitteeDataDocumentedNormal = async () => {
		let offset = 2;

		let canvas_font_size = 20 * offset;
		let table_offset_x = 88 * offset;
		let table_offset_y = 212.1 * offset;
		let table_width = 420 * offset;
		let table_right_padding = 10 * offset;
		let table_row_spacing = 15 * offset;
		let table_top_padding = table_row_spacing / 2;
		let table_column_spacing = table_right_padding;
		let table_row_divider_padding = 3 * offset;

		var ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		let texts = organizeInfo();

		let background = await loadImage(bgNormal);

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
		ctx.font = `60px custom-arabic`;

		// Add scissors and dashed line
		// ctx.fillText(warning, ctx.canvas.width / 2 - ctx.measureText(warning).width / 2, table_offset_y + tableHeight + 30 * 2 + 65);
		ctx.fillText(warning, ctx.canvas.width / 2 - ctx.measureText(warning).width / 2, table_offset_y + tableHeight + (30 * 2 + 65));
		context.line(0, table_offset_y + tableHeight + 30 * 2, ctx.canvas.width, table_offset_y + tableHeight + 30 * 2);
		ctx.strokeStyle = '#8F8F8F';

		context.line(0, table_offset_y + tableHeight + (30 * 2 + 100), ctx.canvas.width, table_offset_y + tableHeight + (30 * 2 + 100), [(10, 5)]);
		context.line(ctx.canvas.width, 0, ctx.canvas.width, ctx.canvas.height, [10, 5]);

		let scissors = await loadImage(scissorsIcon);
		let size = 32;

		ctx.drawImage(scissors.image, 50, table_offset_y + tableHeight + (30 * 2 + 100) - size / 2, size, size);

		return ctx.canvas.toDataURL('image/jpeg');
	};
	const getCommitteeDataDocumentedMiniature = async () => {
		let minifier = 0.42857142857;
		let minified_padding = 20;
		let minified_bottom_padding = 10;
		let offset = 2;

		let canvas_font_size = 20 * offset * minifier;
		let table_offset_x = (88 + minified_padding) * offset * minifier;
		let table_offset_y = (165.1 + minified_padding) * offset * minifier;
		let table_width = 420 * offset * minifier;
		let table_right_padding = 10 * offset * minifier;
		let table_row_spacing = 15 * offset * minifier;
		let table_top_padding = (table_row_spacing / 2) * minifier;
		let table_column_spacing = table_right_padding * minifier;
		let table_row_divider_padding = 3 * offset * minifier;

		var ctx = canvas.current.getContext('2d');
		let context = new CanvasContext(ctx);

		let texts = organizeInfo();

		let background = await loadImage(bgMinified);

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

		// if(minifier)

		return ctx.canvas.toDataURL('image/jpeg');
	};

	const getCommitteeDataDocumented = async () => {
		let data;
		let direction = main.language == 'ar' ? 'rtl' : 'ltr';

		if (state.design == 'normal') {
			data = await getCommitteeDataDocumentedNormal(direction, state.scale / 100);
		} else {
			data = await getCommitteeDataDocumentedMiniature(direction, state.scale / 100);
		}

		return data;
	};

	const saveAsPhoto = async () => {
		let data = await getCommitteeDataDocumented();

		download.current.href = data;
		download.current.click();
	};

	const saveAsDocument = async () => {
		let data = await getCommitteeDataDocumented();
		let image = scaleDimensionsTo(await loadImage(data), 210);

		pdf.addImage(data, 0, 0, image.width, image.height);
		pdf.save('اللجنة');
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
		ctx.font = 'normal 18px custom-arabic';
		ctx.fillStyle = 'black';
		ctx.fillText('123', 50, 50);
		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
		switchLocale(main.language, '/committee-researcher');
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
				id='committee-researcher-page'
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
								label={getLocaleKey(main.language, '/committee-researcher', 'field-label')}
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
								justifyContent: main.language == 'en' ? 'flex-start' : 'flex-end',
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
							<div
								style={{
									border: '1px solid #C4C4C4',
									borderRadius: '5px',
									fontSize: '18px',
									// paddingRight: '10px',
									marginBottom: '10px',
								}}
							>
								{state.info != null
									? Object.entries(main.language == 'en' ? state.infoEn : state.info).map(([key, value], index) => {
											let switches = main.language == 'en' ? switchesEn : switchesAr;
											let font = 'custom-arabic';

											let maximum = Object.keys(state.info)
												.map((key) => measureText(switches[key], `18px ${font}`))
												.sort((a, b) => b - a)[0];

											let self = measureText(switches[key], `18px $[font}`);

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
															padding: main.language == 'en' ? '0px 0px 0px 10px' : '0px 10px 0px 0px',
															boxSizing: 'border-box',
														}}
													>
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																textAlign: 'center',
																wordBreak: 'break-word',
																flexDirection: main.language == 'en' ? 'row' : 'row-reverse',
																width: '100%',
																fontFamily: font,
															}}
														>
															{switches[key]}
															<Divider
																style={{
																	height: '100%',
																	backgroundColor: '#C4C4C4',
																	margin: main.language == 'en' ? `0px ${6}px 0px ${maximum - self + 6}px` : `0px ${maximum - self + 6}px 0px ${6}px`,
																}}
																orientation='vertical'
															/>
															<span style={{ fontFamily: 'Arial' }}>{value}</span>
														</div>
													</div>
													{index != Object.keys(state.info).length - 1 && <Divider style={{ width: '100%', backgroundColor: '#C4C4C4' }} />}
												</div>
											);
									  })
									: null}
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
								<ChoiceField
									choices={mergeAsObject(['normal', 'miniature'], getLocaleKey(main.language, '/committee-researcher', 'design-field-choices'))}
									default='normal'
									onChange={(id) => {
										setState({
											...state,
											design: id,
										});
									}}
									name={getLocaleKey(main.language, '/committee-researcher', 'design-field-name')}
									language={main.language}
									id='committee-researcher-design-choice-field'
								/>

								<ChoiceField
									choices={mergeAsObject(['pdf', 'jpg'], getLocaleKey(main.language, '/committee-researcher', 'file-field-choices'))}
									default='pdf'
									onChange={(id) => {
										setState({
											...state,
											file: id,
										});
									}}
									name={getLocaleKey(main.language, '/committee-researcher', 'file-field-name')}
									language={main.language}
									id='committee-researcher-file-choice-field'
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
				Test number: 123
			</div>
		</ThemeProvider>
	);
}
