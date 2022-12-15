import React from 'react';
import { Divider } from '@mui/material';
import useDateHook from 'hooks/DateHook';
import { useMediaPredicate } from 'react-media-hook';

export default function Month(props) {
	const { fromEnToArWeekday, fromEnToArInteger, getHijriDate, compareDatesByDay } = useDateHook();

	const getItemByStatus = (item) => {
		// let date = getHijriDate(item.day, props.monthIndex, 1444);

		// console.log(date);

		switch (item.status) {
			case 'normal':
				return (
					<div
						className='month-column-item'
						style={{
							// border: compareDatesByDay(date, new Date()) ? '3px solid #233262' : '1px solid #707070',
							border: '1px solid #707070',
						}}
					>
						<div className='month-column-item-day' style={{ color: '#D68C45' }}>
							{fromEnToArInteger(item.day)}
						</div>
						{/* <Divider style={{ width: 'calc(100% + 15px)', backgroundColor: '#707070', marginTop: '10px', marginBottom: '10px', marginRight: '-15px' }} /> */}
						<div className='month-column-item-info'>{item.info}</div>
					</div>
				);

			case 'trespass':
				return (
					<div className='month-column-item-trespass'>
						<div>{item.month}</div>
						<div>-</div>
						<div>{fromEnToArInteger(item.day)}</div>
					</div>
				);

			case 'none':
				return (
					<div className='month-column-item-none'>
						هذا الشهر لا يحتوي على أي إجازات
						{/* <svg
							height='100%'
							width='100%'
							style={{
								borderRadius: '18px', // 20px - 2px (border width * 2)
							}}
						>
							<line
								x1='0px'
								y1='0px'
								x2='100%'
								y2='100%'
								style={{
									stroke: '#707070',
									strokeWidth: 1,
								}}
							/>
							<line
								x1='0'
								y1='100%'
								x2='100%'
								y2='0'
								style={{
									stroke: '#707070',
									strokeWidth: 1,
								}}
							/>
						</svg> */}
					</div>
				);
			case 'filler':
				return (
					<div
						className='month-column-item'
						style={{
							// border: compareDatesByDay(date, new Date()) ? '3px solid #233262' : '1px solid #707070',
							border: '1px solid #707070',
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
		let data = Object.values(props.columns)
			.flat()
			.filter((item) => item.info != '' && item.status == 'normal')
			.sort((a, b) => b.day - a.day);

		if (data.length < 1) data.push({ status: 'none' });

		return data;
	};

	const adjust = useMediaPredicate('(max-width: 700px)');

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
				alignItems: 'flex-end',
				justifyContent: 'center',
				width: '100%',
			}}
		>
			<div className='month-title' style={{ color: '#233262' }}>
				{props.month}
			</div>

			<div className='month-header'>
				<div className='month-header-item'>الأحد</div>
				<div className='month-header-item'>الأثنين</div>
				<div className='month-header-item'>الثلاثاء</div>
				<div className='month-header-item'>الأربعاء</div>
				<div className='month-header-item'>الخميس</div>
			</div>

			<div
				className='month-content'
				style={{
					width: '100%',
				}}
			>
				{(adjust ? getSimplifiedColumns() : getFlattenedColumns()).map((item) => {
					return <div className='month-column-item-holder'>{getItemByStatus(item)}</div>;
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
