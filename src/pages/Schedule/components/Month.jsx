import React from 'react';
import { Divider } from '@mui/material';
import useDateHook from 'hooks/DateHook';
import { useMediaPredicate } from 'react-media-hook';
import { useMainContext } from 'contexts/MainContext.jsx';
import useLocaleHook from 'hooks/LocaleHook.js';

export default function Month(props) {
	const { main } = useMainContext();
	const { fromEnToArWeekday, fromEnToArInteger, getHijriDate, compareDatesByDay, hijriMonthEnToAr } = useDateHook();
	const { getLocaleKey } = useLocaleHook();

	const max1130 = useMediaPredicate('(max-width: 1130px)');

	const getItemByStatus = (item) => {
		// let date = getHijriDate(item.day, props.monthIndex, 1444);

		// console.log(date);
		switch (item.status) {
			case undefined:
				return (
					<div
						className='month-column-item'
						style={{
							// border: compareDatesByDay(date, new Date()) ? '3px solid #233262' : '1px solid #707070',
							border: '1px solid #707070',
							flexDirection: main.language == 'en' ? 'row-reverse' : 'row',
						}}
					>
						<div className='month-column-item-day' style={{ color: '#D68C45' }}>
							{main.language == 'en' ? item.day : fromEnToArInteger(item.day)}
						</div>
						{/* <Divider style={{ width: 'calc(100% + 15px)', backgroundColor: '#707070', marginTop: '10px', marginBottom: '10px', marginRight: '-15px' }} /> */}
						<div
							className='month-column-item-info'
							style={{
								textAlign: main.language == 'en' ? 'left' : 'right',
								padding: max1130 ? (main.language == 'en' ? '0px 5px 0px 0px' : '0px 0px 0px 5px') : '0px',
							}}
						>
							{item.value}
						</div>
					</div>
				);

			case 'trespass':
				return (
					<div className='month-column-item-trespass'>
						<div>{main.language == 'en' ? item.month : hijriMonthEnToAr(item.month)}</div>
						<div>-</div>
						<div>{main.language == 'en' ? item.day : fromEnToArInteger(item.day)}</div>
					</div>
				);

			case 'none':
				return (
					<div className='month-column-item-none' data-locale-key='day-value-none'>
						{getLocaleKey(main.language, '/schedule', 'day-value-none')}
					</div>
				);
			case 'filler':
				return (
					<div
						className='month-column-item'
						style={{
							display: 'none',
						}}
					></div>
				);
		}
	};

	const getFlattenedColumns = () => {
		const flattened = [];
		let maximum = Object.values(props.columns).sort((a, b) => b.length - a.length)[0].length;
		for (let i = 0; i < maximum; i++) {
			for (let j = 0; j < 5; j++) {
				let item = Object.values(props.columns)[j][i];

				flattened.push(item || { status: 'filler' });
			}
		}
		return flattened;
	};

	const getSimplifiedColumns = () => {
		let data = props.days.filter((item) => item.value);

		if (data.length < 1) data.push({ status: 'none' });

		return data;
	};

	const max700 = useMediaPredicate('(max-width: 700px)');

	// console.log(props.month);
	// for (let [key, value] of Object.entries(props.columns)) {
	// console.log(key);
	// console.log(value.map((item) => item.day).join(', '));
	// }
	// console.log(props.columns);
	// console.log()

	// console.log(flattened);
	return (
		<div
			className='month'
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: main.language == 'en' ? 'flex-start' : 'flex-end',
				justifyContent: 'center',
				width: '100%',
			}}
		>
			<div className='month-title' style={{ color: '#233262' }}>
				{main.language == 'en' ? props.month : hijriMonthEnToAr(props.month)}
			</div>

			<div
				className='month-header'
				style={{
					flexDirection: main.language == 'en' ? 'row' : 'row-reverse',
				}}
			>
				{(main.language == 'en' ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] : ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']).map((item) => {
					return (
						<div className='month-header-item' style={{ textAlign: main.language == 'en' ? 'left' : 'right' }}>
							{item}
						</div>
					);
				})}
			</div>

			<div
				className='month-content'
				style={{
					width: '100%',
					flexDirection: main.language == 'en' ? 'row' : 'row-reverse',
				}}
			>
				{(max700 ? getSimplifiedColumns() : props.days).map((item, index) => {
					return (
						<div className='month-column-item-holder' key={`item-${index}-${props.month}-${props.semester}`}>
							{getItemByStatus(item)}
						</div>
					);
				})}
			</div>
			{/* <div
				className='month-content'
				style={{
					display: 'flex',
					flexDirection: 'row-reverse',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				{Object.entries(props.columns).map(([weekday, data]) => {
					return (
						<div
							className='month-column'
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-end',
								fontSize: '24px',
								marginTop: '15px',
							}}
						>
							<div
								className='month-column-title'
								style={{
									marginBottom: '15px',
									fontSize: '20px',
								}}
							>
								{fromEnToArWeekday(weekday)}
							</div>

							{data.map((item) => {
								return <div className='month-column-item-holder'>{getItemByStatus(item)}</div>;
							})}
						</div>
					);
				})}
			</div> */}
		</div>
	);
}
