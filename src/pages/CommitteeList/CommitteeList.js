import React, { useRef, useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import SearchBar from './components/SearchBar.jsx';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import useUtilityHook from 'hooks/UtilityHook';
import useDateHook from 'hooks/DateHook';
import { Divider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { fuzzy } from 'fast-fuzzy';
import json from './remove_later.json';
import './CommitteeList.scss';
import useLocaleHook from 'hooks/LocaleHook';
import { useMainContext } from 'contexts/MainContext';
import transliteration from './transliterated.json';

let classes = ['أول ', 'ثاني ', 'ثالث '];
let names = ['يوسف مصطفى الأمين', 'أحمد خالد يوسف الدوسري', 'علي جعفر يوسف عللي', 'أبراهيم قلتلي محمد القحطاني'];

// list is locked at the start of every semester, unlocked by env variable

const COMMITTEE_PER_ROW = 3;

// TODO: search autocomplete

const switchables = {
	'ا': ['أ', 'إ'],
	'ة': ['ه'],
};

const years = {
	'أول': 'First',
	'ثاني': 'Second',
	'ثالث': 'Third',
};

export default function CommitteeList() {
	const [state, setState] = useState({
		data: [],
		visualized: [],
		search: '',
		students: [],
	});

	const { main } = useMainContext();
	const { getRTLFieldTheme } = useUtilityHook();
	const { fromEnToArInteger } = useDateHook();

	const { switchLocale } = useLocaleHook();

	const organizeRealData = () => {
		let data = {};

		json.map((student, index) => {
			let info = {
				ar: {
					name: student['student-name'],
					classyear: `${student.class.slice(2)} ثانوي`,
				},
				en: {
					name: student['student-name']
						.split(' ')
						.map((word) => transliteration[word])
						.join(' '),
					classyear: `${years[student.class.slice(2)]} year`,
				},
				accuracy: 0,
				highlighted: false,
			};

			data[student.committee] = {
				...(data[student.committee] || {
					classname: student.area,
				}),
				students: data[student.committee] != undefined ? data[student.committee].students.concat([info]) : [info],
				// (data[student.committee] || []).concat([student])
			};
		});

		// console.log(data);

		let reorganized = [];
		for (let [committee, value] of Object.entries(data)) {
			let classname = value.classname.trim();
			console.log(classname);
			if (/\d/.test(classname)) {
				classname = `الصف ${classname
					.split('')
					.map((char) => (/\d/.test(char) ? fromEnToArInteger(char) : char))
					.reverse()
					.join('')}`;
			}

			let classnameEn = value.classname.trim();
			if (/\d/.test(classnameEn)) {
				classnameEn = `Class ${classnameEn}`;
			}

			reorganized.push({
				committee: {
					ar: `اللجنة ${fromEnToArInteger(committee)}`,
					en: `Committee ${committee}`,
					highlighted: false,
				},
				classroom: { ar: classname, en: classnameEn, highlighted: false },
				students: value.students,
			});
		}

		return reorganized;
		// console.log(reorganized);
	};

	const normalizeArabic = (string) => {
		return string
			.split('')
			.map((character) => {
				// if (/\d/.test(character)) return fromEnToArInteger(character);

				for (let [key, value] of Object.entries(switchables)) {
					if (value.includes(character)) return key;
				}

				return character;
			})
			.join('');
	};

	const arabicDigitizeString = (string) => {
		return string
			.split('')
			.map((character) => (/\d/.test(character) ? fromEnToArInteger(character) : character))
			.join('');
	};

	const reverseString = (string) => string.split('').reverse().join('');

	const onSearchChange = (value) => {
		if (value.length == 0) {
			return setState({
				...state,
				visualized: state.data,
				search: '',
			});
		}

		let search = value
			.split(' ')
			.map((word) => {
				if (/\d/.test(word)) {
					// return arabicDigitizeString(word);
					return arabicDigitizeString(reverseString(word));
				}
				return word;
			})
			.join(' ');

		// switch
		search = normalizeArabic(search);

		setState({
			...state,
			visualized: state.data
				.map((item) => {
					return {
						...item,
						committee: {
							...item.committee,
							highlighted: item.committee[main.language].includes(search),
						},
						classroom: {
							...item.classroom,
							highlighted: item.classroom[main.language].includes(search),
						},
						students: item.students.map((student) => {
							let { name } = student[main.language];

							name = main.language == 'ar' ? normalizeArabic(name) : name;

							// console.log(`${student.name} ===> ${value} ---> ${fuzzy(value, student.name)}`);

							let words = search
								.split(' ')
								.map((word) => word.trim())
								.filter((word) => word);

							let condition =
								words.length != 0
									? words.every((word) => {
											return name.split(' ').some((part) => {
												// console.log(`${part} -> ${word} -> ${fuzzy(word, part)}`);

												return fuzzy(word, part) > 0.7;
											});
									  })
									: false;

							let accuracy = words.map((word) => {
								let comparisons = name.split(' ').map((part) => fuzzy(word, part));
								let average = comparisons.reduce((a, b) => a + b, 0) / comparisons.length;

								return average;
							});

							accuracy = accuracy.reduce((a, b) => a + b, 0) / accuracy.length;
							// console.log(`Matching ${value} with ${name} -> ${condition}`);
							// console.log(value.split(' ').filter((word) => word));
							// value.split(' ').map((word) => {
							// 	console.log(word);
							// 	console.log(student.name.split(' ').some((part) => fuzzy(part, word) > 0.9));
							// });
							// console.log(
							// 	value.split(' ').map((word) => {
							// 		return fuzzy(
							// 			word,
							// 			student.name.split(' ').find((part) => fuzzy(part, word) > 0.9)
							// 		);
							// 	})
							// );

							return {
								...student,
								// highlighted: student.classyear.includes(value) || student.name.includes(value),
								// highlighted: fuzzy(value, student.name) > 0.9,
								accuracy: accuracy,
								highlighted: condition,
							};
						}),
					};
				})
				.filter((item) => {
					return item.students.some((student) => student.highlighted) || item.committee.highlighted || item.classroom.highlighted;
				})
				.sort((a, b) => {
					return (
						b.students
							.map((item) => item.accuracy)
							.reduce((a, b) => {
								return Math.max(a, b);
							}, -1) /
							b.students.length -
						a.students
							.map((item) => item.accuracy)
							.reduce((a, b) => {
								return Math.max(a, b);
							}, -1) /
							a.students.length
					);
				}),

			search: main.language == 'ar' ? arabicDigitizeString(value) : value,
		});
	};

	useEffect(() => {
		// let data = getSudoData(10, 5, 10);
		let data = organizeRealData();
		setState({
			data: data,
			visualized: data,
		});

		switchLocale(main.language, '/committee-list');
	}, []);

	const onLanguageChange = (lang) => {
		// setState({
		// 	...state,
		// 	visualized: state.visualized.map((committee) => {
		// 		return {
		// 			...committee,
		// 			students: committee.students.map((student) => {
		// 				return {
		// 					...student,
		// 					name: student[main.language],
		// 				};
		// 			}),
		// 		};
		// 	}),
		// });
		setState({
			...state,
			visualized: state.data,
			search: '',
		});

		switchLocale(lang, '/schedule');
	};

	return (
		<ThemeProvider
			theme={getRTLFieldTheme({
				shadows: ['none'],
			})}
		>
			<div id='committee-list-page' className='App page'>
				<div style={{ height: '100%', width: '100%', paddingLeft: '3.125vw', paddingRight: '3.125vw', boxSizing: 'border-box', zIndex: '5' }}>
					{/* <div style={{ height: '100%', width: '100%', boxSizing: 'border-box', zIndex: '5' }}> */}
					<Header onLanguageChange={onLanguageChange} />
					<div id='committee-list' style={{ marginTop: '30px' }}>
						<SearchBar onChange={(event) => onSearchChange(event.target.value)} value={state.search} direction={main.language == 'ar' ? 'rtl' : 'ltr'} />

						<div className='student-tables'>
							{state.visualized.map(({ committee, classroom, students }) => {
								students = students
									.sort(function (a, b) {
										let { name: nameA } = a[main.language];
										let { name: nameB } = b[main.language];

										nameA = nameA.toLowerCase();
										nameB = nameB.toLowerCase();

										if (nameA < nameB) {
											return -1;
										}
										if (nameA > nameB) {
											return 1;
										}
										return 0;
									})
									.sort((a, b) => (a.highlighted === b.highlighted ? 0 : a.highlighted ? -1 : 1));

								return (
									<div
										className='student-table-container'
										style={{
											alignItems: main.language == 'ar' ? 'flex-end' : 'flex-start',
										}}
									>
										<div
											className='committee-name'
											style={{
												color: committee.highlighted ? 'red' : '#233262',
											}}
										>
											{committee[main.language]}
										</div>
										<div
											className='committee-class'
											style={{
												color: classroom.highlighted ? 'red' : '#233262',
											}}
										>
											{classroom[main.language]}
										</div>
										<div
											className='student-table'
											style={{
												flexDirection: main.language == 'ar' ? 'row-reverse' : 'row',
											}}
										>
											{/* <div className='student-table-item student-table-header'>
												<div>اسم الطالب</div>
												<div>الفصل</div>
											</div> */}

											{students.map((student) => {
												let { name, classyear } = student[main.language];

												return (
													<div
														className={`student-table-item${main.language == 'en' ? ' student-table-item-en' : ''}`}
														style={{
															color: student.highlighted ? 'red' : '#233262',
															backgroundColor: 'white',
															border: '1px solid gray',
														}}
													>
														<div className='student-table-item-name'>{name.split(' ')[0]}</div>
														<div className='student-table-item-family'>{name.split(' ').slice(1).join(' ')}</div>
														<Divider
															className='student-table-item-divider'
															style={{
																backgroundColor: 'gray',
															}}
														></Divider>
														<div className='student-table-item-class'>{classyear}</div>
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
