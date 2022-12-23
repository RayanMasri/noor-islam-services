import React, { useRef, useEffect, useState } from 'react';
import Header from '../../components/Header.js';
import { IconButton, Divider } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Month from './components/Month.jsx';
import './Schedule.css';
import { toHijri, toGregorian } from 'hijri-converter';
// Ramaḍān (the month of fasting), Shawwāl, Dhū al-Qaʿdah, and Dhū al-Ḥijjah.
import useDateHook from 'hooks/DateHook';
import Semester from './components/Semester.jsx';

import { useMainContext } from 'contexts/MainContext.jsx';
import useLocaleHook from 'hooks/LocaleHook.js';
import data from './data.json';

// TODO: find a row of a value in columns without comparing in a range
// keep in mind each hijri year has different days for each month, so try accommodating, check out https://hijricalendar.me/<year>

export default function Schedule() {
	const { main } = useMainContext();
	const [state, setState] = useState({
		data: null,
	});
	const { getHijriDateWeekDay, hijriMonthEnToAr, getHijriMonthIndex } = useDateHook();
	const { switchLocale } = useLocaleHook();

	// bug: dhu al-hijjah has empty data on sunday, which is not accomodated for

	const localizeDayValue = (value) => {
		if (!Object.keys(data.locale).includes(value)) return '';
		return data.locale[value];
	};

	const getSemestersData = () => {
		return data.semesters.map((semester, i) => {
			let months = [];
			let entries = Object.entries(semester);
			for (let monthIteration in entries) {
				let [month, days] = entries[monthIteration];
				let monthIndex = getHijriMonthIndex(month);
				let firstDay = getHijriDateWeekDay(parseInt(Object.keys(days)[0]), monthIndex, 1444);

				if (monthIteration == 0 || firstDay.index > 4 || firstDay.index < 1) {
					months.push({
						month: month,
						days: Object.entries(days)
							.map(([day, value]) => {
								return {
									day: day,
									value: value,
								};
							})
							.filter((item) => {
								let index = getHijriDateWeekDay(parseInt(item.day), monthIndex, 1444).index;
								return index >= 0 && index <= 4;
							}),
					});
					continue;
				}

				// for (let i = 0; i < 10; i++) {
				// 	console.log(i);
				// 	console.log(getHijriDateWeekDay(i, 2, 1444));
				// }

				// console.log(`${firstDay.ar} -> ${Object.keys(days)[0]}:\n ${firstDay.index} backwards additions`);

				let previousMonth = entries[monthIteration - 1];
				let previousMonthIndex = getHijriMonthIndex(previousMonth[0]);

				// let lastDayPrevious = Object.keys(previousMonth[1]);
				// lastDayPrevious = lastDayPrevious[lastDayPrevious.length - 1];
				// lastDayPrevious = getHijriDateWeekDay(parseInt(lastDayPrevious), previousMonthIndex, 1444);

				let reversed = Object.entries(previousMonth[1])
					.reverse()
					.map(([day, value]) => {
						return {
							index: getHijriDateWeekDay(parseInt(day), previousMonthIndex, 1444).index,
							day: day,
							value: value,
						};
					});

				// console.log(lastDayPrevious);

				days = Object.entries(days)
					.map(([day, value]) => {
						return {
							day: day,
							value: value,
						};
					})
					.filter((item) => {
						let index = getHijriDateWeekDay(parseInt(item.day), monthIndex, 1444).index;

						return index >= 0 && index <= 4;
					});
				for (let i = firstDay.index - 1; i >= 0; i--) {
					let { day, value } = reversed[reversed.findIndex((item) => item.index == i)];

					days.unshift({
						day: day,
						value: value,
						month: previousMonth[0],
						status: 'trespass',
					});
					// days.uns
					// days.unshift

					// console.log(i);
				}

				months.push({
					month: month,
					days: days,
				});

				// console.log(month);
				// console.log(monthIteration);
			}

			months = months.map((month) => {
				let days = month.days.map((day) => {
					return {
						...day,
						value: main.language == 'en' ? localizeDayValue(day.value) : day.value,
					};
				});

				if (month.days.length % 5 != 0) {
					let filler = 5 - (month.days.length % 5);
					for (let i = 0; i < filler; i++) {
						days.push({ day: null, value: null, status: 'filler' });
					}
					// month.days.length
				}

				return {
					...month,
					days: days,
				};
			});

			return {
				months: months,
				semester: i,
			};
		});

		// for (let i = 0; i < data.semesters.length; i++) {
		// 	let semester = data.semesters[i];
		// 	let months = [];
		// 	for (let [month, days] of Object.entries(semester)) {
		// 		let columns = {
		// 			sunday: [],
		// 			monday: [],
		// 			tuesday: [],
		// 			wednesday: [],
		// 			thursday: [],
		// 		};
		// 		let monthIndex = getHijriMonthIndex(month);

		// 		for (let [day, info] of Object.entries(days)) {
		// 			day = parseInt(day);
		// 			let weekday = getHijriDateWeekDay(day, monthIndex, 1444);

		// 			if (Object.keys(columns).includes(weekday.en)) {
		// 				columns[weekday.en].push({ day: day, info: info, status: 'normal' });
		// 			}
		// 		}

		// 		// if (monthIndex == 4) {
		// 		// 	console.log(JSON.stringify(columns));
		// 		// }

		// 		// console.log(month.toUpperCase());

		// 		// get maximum number of items in a column
		// 		let columnMax = Object.values(columns)
		// 			.map((x) => x.length)
		// 			.sort((a, b) => b - a)[0];

		// 		let requests = [];

		// 		for (let [key, value] of Object.entries(columns)) {
		// 			// if column is less than the maximum, needs gap filling from previous/next month
		// 			// console.log(value);
		// 			// console.log(key);
		// 			// console.log(columnMax);
		// 			if (value.length < columnMax) {
		// 				// get index of current column
		// 				let columnIndex = Object.keys(columns).findIndex((x) => x == key);

		// 				// check first column's value row
		// 				let firstItemRow = getRow(0, key, columns);
		// 				// console.log(`${key}: Row of first item ${firstItemRow}`);

		// 				if (firstItemRow != 0) {
		// 					// get last filled column (the column with the maximum) coming from the natural left direction
		// 					let filledColumnIndex = Object.entries(columns).findIndex(([_, value]) => value.length == columnMax);

		// 					// re-reverse index by using this formula: ArrayLength - 1 - ReversedIndex
		// 					// filledColumnIndex = Object.keys(columns).length - 1 - filledColumnIndex;

		// 					// Get index of previous month
		// 					let previousMonth = Object.keys(semester).findIndex((x) => x == month) - 1;

		// 					// console.log(`Previous Month Index: ${previousMonth}`);

		// 					// Get days of previous month
		// 					let previousMonthDays = Object.keys(Object.values(semester)[previousMonth]);

		// 					// console.log(`Column index: ${columnIndex}`);
		// 					// console.log(`Next filled column index: ${filledColumnIndex}`);
		// 					// console.log(`Non reversed: ${Object.entries(columns).findIndex((x) => x[1].length == columnMax)}`);
		// 					// if (month == 'dhu al-hijjah') {
		// 					// }

		// 					let offset = filledColumnIndex - columnIndex;
		// 					let gapDay = previousMonthDays[previousMonthDays.length - offset];

		// 					// add to list of requests to be fulfilled after this loop,
		// 					// instant pushes to the column array taints the results of the next iteration
		// 					requests.push({
		// 						key: key,
		// 						data: {
		// 							day: gapDay,
		// 							month: hijriMonthEnToAr(Object.keys(semester)[previousMonth]),
		// 							info: '',
		// 							status: 'trespass',
		// 						},
		// 						first: true,
		// 					});

		// 					// TODO: this is added here as a rudimentary solution to being able to fill gaps in both directions, look for a better fix
		// 					continue;
		// 				}
		// 			}
		// 		}

		// 		// console.log('-----------------');

		// 		// fulfill requests
		// 		for (let { key, data, first } of requests) {
		// 			if (first) {
		// 				columns[key].unshift(data);
		// 			} else {
		// 				columns[key].push(data);
		// 			}
		// 		}

		// 		months.push({
		// 			month: month,
		// 			columns: columns,
		// 			days: days,
		// 			monthIndex: monthIndex,
		// 		});
		// 	}

		// 	semesters.push({
		// 		semester: i,
		// 		months: months,
		// 	});
		// 	// console.log(months);
		// }

		// return semesters;
	};

	const onLanguageChange = (lang) => {
		setState({
			...state,
			data: getSemestersData(),
		});
		switchLocale(lang, '/schedule');
	};

	useEffect(() => {
		switchLocale(main.language, '/schedule');
	}, []);
	// getSemesterData();
	// console.log(getSemesterData());

	// let sunday = [];
	// let monday = [];
	// let tuesday = [];
	// let wednesday = [];
	// // let friday = [];
	// for (let i = 1; i <= 30; i++) {
	// 	let weekday = getHijriDateWeekDay(i, 2, 1444);
	// 	if (Object.keys(columns).includes(weekday.en)) {
	// 		columns[weekday.en].push({ day: i, info: 'أحمد' });
	// 	}
	// }

	// filling column gaps

	// console.log(columns);

	return (
		<div id='schedule-page' className='App page'>
			<div style={{ width: '100%', paddingLeft: '3.125vw', paddingRight: '3.125vw', boxSizing: 'border-box', zIndex: '5' }}>
				<Header onLanguageChange={onLanguageChange} />
				<div id='schedule' style={{ marginTop: '30px' }}>
					{getSemestersData().map(({ months, semester }) => {
						return <Semester key={`semester-${semester}`} months={months} semester={semester} />;
					})}
				</div>
			</div>

			{/* <div
				id='footer'
				style={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						width: '80%',
						backgroundColor: 'white',
						height: '60px',
						border: '1px solid #B2B9BC',
						borderRadius: '50px 50px 0px 0px',
					}}
				>
					hi THERE
				</div>
			</div> */}
		</div>
	);
}
