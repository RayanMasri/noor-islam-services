import React from 'react';
import { Divider } from '@mui/material';
import useDateHook from 'hooks/DateHook';

export default function Month(props) {
	const { fromEnToArWeekday, fromEnToArInteger, getHijriDate, compareDatesByDay } = useDateHook();

	const getItemByStatus = (item) => {
		let date = getHijriDate(item.day, props.monthIndex, 1444);

		// console.log(date);

		switch (item.status) {
			case 'normal':
				return (
					<div
						className='month-column-item'
						style={{
							border: compareDatesByDay(date, new Date()) ? '3px solid #233262' : '1px solid #707070',
						}}
					>
						<div style={{ fontSize: '26px', color: '#D68C45' }}>{fromEnToArInteger(item.day)}</div>
						{/* <Divider style={{ width: 'calc(100% + 15px)', backgroundColor: '#707070', marginTop: '10px', marginBottom: '10px', marginRight: '-15px' }} /> */}
						<div>{item.info}</div>
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
						<svg
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
						</svg>
					</div>
				);
		}
	};

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
			<div className='month-header' style={{ color: '#233262', fontSize: '42px' }}>
				{props.month}
			</div>

			<div
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
			</div>
		</div>
	);
}
