import React, { useState } from 'react';
import { IconButton, Divider } from '@mui/material';
import Month from './Month.jsx';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useDateHook from 'hooks/DateHook.jsx';
import calculateTextWidth from 'calculate-text-width';
import { toHijri, toGregorian } from 'hijri-converter';

const WARN_PADDING = 15;
const WARN_SIZE = 50;

export default function Semester(props) {
	const { hijriMonthEnToAr, fromEnToArInteger, getHijriMonthIndex, getHijriDate } = useDateHook();

	let lastMonth = props.months[props.months.length - 1];
	let lastDay = parseInt(Object.keys(lastMonth.days)[Object.keys(lastMonth.days).length - 1]);
	let lastDate = getHijriDate(lastDay, getHijriMonthIndex(lastMonth.month), 1444);

	let passed = lastDate - new Date() < 0;

	const [state, setState] = useState({
		open: !passed,
		passed: passed,
	});
	const semester_names = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني', 'الفصل الدراسي الثالث'];
	return (
		<div className='semester' style={{ width: '100%' }}>
			<div
				className='semester-header'
				style={{
					fontSize: '50px',
					color: '#233262',
					width: '100%',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'flex-end',
					alignItems: 'center',
					// backgroundColor: 'blue',
				}}
			>
				<IconButton
					sx={{
						width: '64px',
						height: '64px',
						marginRight: '15px',
					}}
					onClick={() => setState({ ...state, open: !state.open })}
				>
					<KeyboardArrowDownIcon
						sx={{
							width: '64px',
							height: '64px',
							color: '#233262',
							transform: `rotate(${state.open ? '0' : '-90'}deg)`,
						}}
					/>
				</IconButton>
				{/* <div
					style={{
						width: '64px',
						height: '64px',
						// border: '1px solid #707070',
						// backgroundColor: 'white',
						// borderRadius: '64px'
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'flex-end',
						color: '#D68C45',
						marginTop: '15px',
						fontSize: '70px',
						fontFamily: 'Arial',
						fontWeight: 'bolder',
						marginRight: '15px',
					}}
				>
					{fromEnToArInteger(props.semester + 1)}
				</div> */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'row-reverse',
					}}
				>
					<div
						style={{
							// color: '#233262',
							// color: 'black',
							// color: '#D68C45',
							color: '#D68C45',
							marginLeft: '15px',
							fontFamily: 'Arial',
							fontWeight: 'bolder',
							// lineHeight: '0',
							fontSize: '70px',
							width: '64px',
							height: '64px',
							border: '1px solid #707070',
							backgroundColor: 'white',
							borderRadius: '64px',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							paddingTop: '10px',
							boxSizing: 'border-box',
							marginTop: '4px',
						}}
					>
						{fromEnToArInteger(props.semester + 1)}
					</div>
					{/* <div
						style={{
							// color: '#8b0202',
							color: '#D68C45',
							marginLeft: '15px',
							fontFamily: 'Arial',
							fontWeight: 'bolder',
							fontSize: '60px',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							paddingTop: '5px',
						}}
					>
						-{fromEnToArInteger(props.semester + 1)}
					</div> */}
					<div>{semester_names[props.semester]}</div>
				</div>
			</div>
			<div
				style={{
					height: state.open ? 'auto' : '0px',
					overflow: state.open ? 'visible' : 'hidden',
					position: 'relative',
				}}
			>
				{!state.passed ? (
					<Divider style={{ width: '100%', backgroundColor: '#707070', marginTop: '15px', marginBottom: props.semester == 0 ? '0px' : '10px' }} />
				) : (
					<div
						style={{
							marginTop: `40px`,
							marginBottom: props.semester == 0 ? '0px' : '10px',
							position: 'relative',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
							width: '100%',
							pointerEvents: 'none',
						}}
					>
						<Divider
							style={{
								width: `calc((100% / 2) - ${calculateTextWidth('تم مرور هذا الفصل الدراسي', `${WARN_SIZE}px custom-arabic`) / 2}px - ${WARN_PADDING}px)`,
								// backgroundColor: 'red',
								backgroundColor: '#8b0202',
								position: 'absolute',
								top: '0',
								left: '0',
							}}
						/>
						<Divider
							style={{
								width: `calc((100% / 2) - ${calculateTextWidth('تم مرور هذا الفصل الدراسي', `${WARN_SIZE}px custom-arabic`) / 2}px - ${WARN_PADDING}px)`,
								// backgroundColor: 'green',
								backgroundColor: '#8b0202',
								position: 'absolute',
								top: '0',
								right: '0',
							}}
						/>
						<div
							style={{
								position: 'absolute',
								top: `-${WARN_SIZE}px`,
								left: `calc(50% - ${calculateTextWidth('تم مرور هذا الفصل الدراسي', `${WARN_SIZE}px custom-arabic`) / 2}px)`,
								fontSize: `${WARN_SIZE}px`,
								fontFamily: 'custom-arabic',
								color: '#8b0202',
							}}
						>
							تم مرور هذا الفصل الدراسي
						</div>
					</div>
				)}
				<div>
					{props.months.map(({ month, columns, monthIndex }) => {
						return <Month columns={columns} month={hijriMonthEnToAr(month)} monthIndex={monthIndex} />;
					})}
				</div>
			</div>
		</div>
	);
}
