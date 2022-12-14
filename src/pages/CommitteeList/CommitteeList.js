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
import './CommitteeList.css';

let classes = ['أول ', 'ثاني ', 'ثالث '];
let names = ['يوسف مصطفى الأمين', 'أحمد خالد يوسف الدوسري', 'علي جعفر يوسف عللي', 'أبراهيم قلتلي محمد القحطاني'];

const COMMITTEE_PER_ROW = 3;

// TODO: search autocomplete

const switchables = {
	'ا': ['أ', 'إ'],
	'ة': ['ه'],
};

export default function CommitteeList() {
	const [state, setState] = useState({
		data: [],
		visualized: [],
		search: '',
	});

	const { getRTLFieldTheme } = useUtilityHook();
	const { fromEnToArInteger } = useDateHook();

	console.log(json);

	// min -> inclusive, max -> inclusive
	const getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	const getSudoData = (committees, studentMin, studentMax) => {
		let data = [];
		for (let i = 0; i < committees; i++) {
			let students = getRandomInt(studentMin, studentMax);
			let studentsArr = [];
			for (let j = 0; j < students; j++) {
				studentsArr.push({
					classyear: `${classes[getRandomInt(0, 2)]} ثانوي`,
					name: names[getRandomInt(0, names.length - 1)],
					highlighted: false,
				});
			}

			data.push({
				committee: {
					value: `اللجنة ${fromEnToArInteger(getRandomInt(0, 100))}`,
					highlighted: false,
				},
				classroom: {
					value: `الصف ${fromEnToArInteger(getRandomInt(1, 3))}/${fromEnToArInteger(getRandomInt(1, 3))}`,
					highlighted: false,
				},
				students: studentsArr,
			});
		}
		return data;
	};

	const chunkify = (array, chunkSize) => {
		let chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		return chunks;
	};

	const organizeRealData = () => {
		let data = {};

		json.map((student) => {
			let info = {
				name: student['student-name'],
				classyear: `${student.class.slice(2)} ثانوي`,
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
			if (/\d/.test(classname)) {
				classname = `الصف ${classname
					.split('')
					.map((char) => (/\d/.test(char) ? fromEnToArInteger(char) : char))
					.reverse()
					.join('')}`;
			}

			reorganized.push({
				committee: { value: `اللجنة ${fromEnToArInteger(committee)}`, highlighted: false },
				classroom: { value: classname, highlighted: false },
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
		// console.log(arabicDigitizeString(value));
		// console.log(

		// );

		// console.log(value);
		setState({
			...state,
			visualized: state.data
				.map((item) => {
					return {
						...item,
						committee: {
							...item.committee,
							highlighted: item.committee.value.includes(search),
						},
						classroom: {
							...item.classroom,
							highlighted: item.classroom.value.includes(search),
						},
						students: item.students.map((student) => {
							let name = normalizeArabic(student.name);
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

												return fuzzy(word, part) > 0.9;
											});
									  })
									: false;
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
								highlighted: condition,
							};
						}),
					};
				})
				.filter((item) => {
					return item.students.some((student) => student.highlighted) || item.committee.highlighted || item.classroom.highlighted;
				}),
			search: arabicDigitizeString(value),
		});
	};

	useEffect(() => {
		// let data = getSudoData(10, 5, 10);
		let data = organizeRealData();
		setState({
			data: data,
			visualized: data,
		});
	}, []);

	useEffect(() => {
		console.log(state.search);
	}, [state.search]);

	return (
		<ThemeProvider
			theme={getRTLFieldTheme({
				shadows: ['none'],
			})}
		>
			<div id='committee-list-page' className='App page'>
				<div style={{ height: '100%', width: '100%', paddingLeft: '60px', paddingRight: '60px', boxSizing: 'border-box', zIndex: '5' }}>
					{/* <div style={{ height: '100%', width: '100%', boxSizing: 'border-box', zIndex: '5' }}> */}
					<Header />
					<div id='committee-list' style={{ marginTop: '30px' }}>
						<SearchBar onChange={(event) => onSearchChange(event.target.value)} value={state.search} />

						<div className='student-tables'>
							{state.visualized.map(({ committee, classroom, students }) => {
								students = students
									.sort(function (a, b) {
										if (a.name < b.name) {
											return -1;
										}
										if (a.name > b.name) {
											return 1;
										}
										return 0;
									})
									.sort((a, b) => (a.highlighted === b.highlighted ? 0 : a.highlighted ? -1 : 1));

								return (
									<div className='student-table-container'>
										<div
											className='committee-name'
											style={{
												color: committee.highlighted ? 'red' : '#233262',
											}}
										>
											{committee.value}
										</div>
										<div
											className='committee-class'
											style={{
												color: classroom.highlighted ? 'red' : '#233262',
											}}
										>
											{classroom.value}
										</div>
										<div className='student-table'>
											{/* <div className='student-table-item student-table-header'>
												<div>اسم الطالب</div>
												<div>الفصل</div>
											</div> */}

											{students.map(({ name, classyear, highlighted }) => {
												return (
													<div
														className='student-table-item'
														style={{
															color: highlighted ? 'red' : '#233262',
															backgroundColor: 'white',
															border: '1px solid gray',
														}}
													>
														<div style={{ fontSize: '38px' }}>{name.split(' ')[0]}</div>
														<div
															style={{
																fontSize: '20px',
															}}
														>
															{name.split(' ').slice(1).join(' ')}
														</div>
														<Divider
															style={{
																width: 'calc(100% + 20px)',
																backgroundColor: 'gray',
																margin: '10px 0px 10px 0px',
															}}
														></Divider>
														<div
															style={{
																fontSize: '14px',
															}}
														>
															{classyear}
														</div>
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
