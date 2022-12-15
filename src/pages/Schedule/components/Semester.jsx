import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Divider } from '@mui/material';
import Month from './Month.jsx';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useDateHook from 'hooks/DateHook.jsx';
import calculateTextWidth from 'calculate-text-width';

export default function Semester(props) {
	const { hijriMonthEnToAr, fromEnToArInteger, getHijriMonthIndex, getHijriDate } = useDateHook();

	const getLastDate = () => {
		let lastMonth = props.months[props.months.length - 1];
		let lastDay = parseInt(Object.keys(lastMonth.days)[Object.keys(lastMonth.days).length - 1]);
		return getHijriDate(lastDay, getHijriMonthIndex(lastMonth.month), 1444);
	};

	let passed = getLastDate() - new Date() < 0;
	const [state, _setState] = useState({
		open: !passed,
		passed: passed,
		warn_size: '50px',
		warn_padding: '15px',
	});
	const _state = useRef(state);
	const setState = (data) => {
		_state.current = data;
		_setState(data);
	};

	const onResize = () => {
		if (window.innerWidth < 700) {
			setState({
				..._state.current,
				warn_size: `${(window.innerWidth * 7.14) / 100}px`,
				warn_padding: `${(window.innerWidth * 2.14) / 100}px`,
			});
		} else {
			if (state.warn_size == '50px') return;
			setState({
				..._state.current,
				warn_size: '50px',
				warn_padding: '15px',
			});
		}
	};

	useEffect(() => {
		onResize();

		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

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
				<IconButton className='semester-header-button' onClick={() => setState({ ...state, open: !state.open })}>
					<KeyboardArrowDownIcon
						className='semester-header-button-icon'
						sx={{
							color: '#233262',
							transform: `rotate(${state.open ? '0' : '-90'}deg)`,
						}}
					/>
				</IconButton>

				<div
					style={{
						display: 'flex',
						flexDirection: 'row-reverse',
						alignItems: 'center',
					}}
				>
					<div
						className='semester-header-number'
						style={{
							// color: '#233262',
							// color: 'black',
							// color: '#D68C45',
							color: '#D68C45',
							fontFamily: 'Arial',
							fontWeight: 'bolder',
							// lineHeight: '0',
							border: '1px solid #707070',
							backgroundColor: 'white',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							boxSizing: 'border-box',
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

					<div className='semester-header-title'>{semester_names[props.semester]}</div>
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
							// pointerEvents: 'none',
						}}
					>
						<Divider
							style={{
								width: `calc((100% / 2) - ${calculateTextWidth('تم مرور هذا الفصل الدراسي', `${state.warn_size} custom-arabic`) / 2}px - ${state.warn_padding})`,
								// backgroundColor: 'red',
								backgroundColor: '#8b0202',
								position: 'absolute',
								top: '0',
								left: '0',
							}}
						/>
						<Divider
							style={{
								width: `calc((100% / 2) - ${calculateTextWidth('تم مرور هذا الفصل الدراسي', `${state.warn_size} custom-arabic`) / 2}px - ${state.warn_padding})`,
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
								top: `-${state.warn_size}`,
								left: `calc(50% - ${calculateTextWidth('تم مرور هذا الفصل الدراسي', `${state.warn_size} custom-arabic`) / 2}px)`,
								fontSize: state.warn_size,
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
