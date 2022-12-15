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

import data from './data.json';

// TODO: find a row of a value in columns without comparing in a range
// keep in mind each hijri year has different days for each month, so try accommodating, check out https://hijricalendar.me/<year>

export default function Schedule() {
	const [state, setState] = useState({});
	const { getHijriDateWeekDay, hijriMonthEnToAr, getHijriMonthIndex } = useDateHook();

	// bug: dhu al-hijjah has empty data on sunday, which is not accomodated for

	const getRow = (itemIndex, columnKey, columns) => {
		let threshold = Object.values(columns)[4][itemIndex].day;
		// console.log(`Threshold: ${threshold}`);

		let item = columns[columnKey][itemIndex];

		if (item == undefined) {
			// FIXME: apply this
			// If item is non-existant, check column index and see the closest column with an existing first item,
			// if no column is found that means the row is the last, if a column is found that means the row is first
			let columnIndex = Object.keys(columns).findIndex((x) => x == columnKey);

			// console.log(columnIndex);

			return -1;
		}

		item = item.day;

		if (item > threshold) {
			return itemIndex + 1;
		}

		return itemIndex;

		// get last columns item at same index, and check if first item is less than the value of this item
		// col;
	};

	const getSemestersData = () => {
		let semesters = [];

		// for (let semester of [data.semesters[2]]) {
		for (let i = 0; i < data.semesters.length; i++) {
			let semester = data.semesters[i];
			let months = [];
			for (let [month, days] of Object.entries(semester)) {
				let columns = {
					sunday: [],
					monday: [],
					tuesday: [],
					wednesday: [],
					thursday: [],
				};
				let monthIndex = getHijriMonthIndex(month);

				for (let [day, info] of Object.entries(days)) {
					day = parseInt(day);
					let weekday = getHijriDateWeekDay(day, monthIndex, 1444);

					if (Object.keys(columns).includes(weekday.en)) {
						columns[weekday.en].push({ day: day, info: info, status: 'normal' });
					}
				}

				// if (monthIndex == 4) {
				// 	console.log(JSON.stringify(columns));
				// }

				// console.log(month.toUpperCase());

				// get maximum number of items in a column
				let columnMax = Object.values(columns)
					.map((x) => x.length)
					.sort((a, b) => b - a)[0];

				let requests = [];

				for (let [key, value] of Object.entries(columns)) {
					// if column is less than the maximum, needs gap filling from previous/next month
					// console.log(value);
					// console.log(key);
					// console.log(columnMax);
					if (value.length < columnMax) {
						// get index of current column
						let columnIndex = Object.keys(columns).findIndex((x) => x == key);

						// check first column's value row
						let firstItemRow = getRow(0, key, columns);
						// console.log(`${key}: Row of first item ${firstItemRow}`);

						if (firstItemRow != 0) {
							// get last filled column (the column with the maximum) coming from the natural left direction
							let filledColumnIndex = Object.entries(columns).findIndex(([_, value]) => value.length == columnMax);

							// re-reverse index by using this formula: ArrayLength - 1 - ReversedIndex
							// filledColumnIndex = Object.keys(columns).length - 1 - filledColumnIndex;

							// Get index of previous month
							let previousMonth = Object.keys(semester).findIndex((x) => x == month) - 1;

							// console.log(`Previous Month Index: ${previousMonth}`);

							// Get days of previous month
							let previousMonthDays = Object.keys(Object.values(semester)[previousMonth]);

							// console.log(`Column index: ${columnIndex}`);
							// console.log(`Next filled column index: ${filledColumnIndex}`);
							// console.log(`Non reversed: ${Object.entries(columns).findIndex((x) => x[1].length == columnMax)}`);
							// if (month == 'dhu al-hijjah') {
							// }

							let offset = filledColumnIndex - columnIndex;
							let gapDay = previousMonthDays[previousMonthDays.length - offset];

							// add to list of requests to be fulfilled after this loop,
							// instant pushes to the column array taints the results of the next iteration
							requests.push({
								key: key,
								data: {
									day: gapDay,
									month: hijriMonthEnToAr(Object.keys(semester)[previousMonth]),
									info: '',
									status: 'trespass',
								},
								first: true,
							});

							// TODO: this is added here as a rudimentary solution to being able to fill gaps in both directions, look for a better fix
							continue;
						}

						// removed due to not being a necessity visually, only first row gaps should be filled as they make weird spaces
						// // gap is from next month
						// if (firstItemRow == 0) {
						// 	// get last filled column (the column with the maximum) coming from the right direction by reversing
						// 	let filledColumnIndex = Object.entries(columns)
						// 		.reverse()
						// 		.findIndex(([key, value]) => value.length == columnMax);

						// 	// re-reverse index by using this formula: ArrayLength - 1 - ReversedIndex
						// 	filledColumnIndex = Object.keys(columns).length - 1 - filledColumnIndex;

						// 	// Get index of next month
						// 	let nextMonth = Object.keys(semester).findIndex((x) => x == month) + 1;

						// 	// Get days of next month
						// 	let nextMonthDays = Object.values(semester)[nextMonth];

						// 	// If last month, just add to requests as none
						// 	if (nextMonthDays == undefined) {
						// 		requests.push({
						// 			key: key,
						// 			data: {
						// 				status: 'none',
						// 			},
						// 			first: false,
						// 		});
						// 		continue;
						// 	}

						// 	nextMonthDays = Object.keys(nextMonthDays);

						// 	let offset = columnIndex - filledColumnIndex;
						// 	let gapDay = nextMonthDays[offset - 1];

						// 	requests.push({
						// 		key: key,
						// 		data: {
						// 			day: gapDay,
						// 			month: hijriMonthEnToAr(Object.keys(semester)[nextMonth]),
						// 			info: '',
						// 			status: 'trespass',
						// 		},
						// 		first: false,
						// 	});
						// }
					}
				}

				// console.log('-----------------');

				// fulfill requests
				for (let { key, data, first } of requests) {
					if (first) {
						columns[key].unshift(data);
					} else {
						columns[key].push(data);
					}
				}

				months.push({
					month: month,
					columns: columns,
					days: days,
					monthIndex: monthIndex,
				});
			}

			semesters.push({
				semester: i,
				months: months,
			});
			// console.log(months);
		}

		// console.log(semesters);

		return semesters;
	};

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
				<Header />
				<div id='schedule' style={{ marginTop: '30px' }}>
					{getSemestersData().map(({ semester, months }) => {
						return <Semester months={months} semester={semester} />;
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
