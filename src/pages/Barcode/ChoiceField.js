import React, { useState, useRef } from 'react';
import { Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SelectMenu from 'components/SelectMenu.js';

export default function ChoiceField(props) {
	const [state, setState] = useState({
		open: false,
		choice: localStorage.getItem(props.id) || props.default || Object.keys(props.choices)[0],
	});

	const anchor = useRef(null);

	return (
		<div
			style={{
				width: '100%',
			}}
		>
			<Button
				className='option-box'
				variant='contained'
				onClick={() => setState({ ...state, open: true })}
				ref={anchor}
				style={{
					fontSize: '18px',
					height: '35px',
					flexDirection: props.language == 'ar' ? 'row' : 'row-reverse',
				}}
				sx={{
					padding: props.language == 'ar' ? '0px 10px 0px 5px !important' : '0px 5px 0px 10px !important',
				}}
			>
				<KeyboardArrowDownIcon />

				<div
					style={{
						display: 'flex',
						flexDirection: props.language == 'ar' ? 'row' : 'row-reverse',
						textTransform: 'none',
					}}
				>
					<span style={{ color: 'gray' }}>{props.choices[state.choice]}</span>

					{`${props.language == 'ar' ? '\u00A0:' : ''}${props.name}${props.language == 'en' ? ':\u00A0' : ''}`}
				</div>
			</Button>
			<SelectMenu
				anchor={anchor.current}
				style={{
					width: '100%',
				}}
				open={state.open}
				selected={state.choice}
				onClose={() => setState({ ...state, open: false })}
				onChange={(id) => {
					setState({
						...state,
						open: false,
						choice: id,
					});

					props.onChange(id);
					localStorage.setItem(props.id, id);
				}}
				options={Object.entries(props.choices).map(([key, value]) => {
					return {
						id: key,
						name: value,
					};
				})}
				MenuListSx={{
					border: '1px solid #b2b9bc',
					boxSizing: 'border-box',
				}}
				sx={{
					marginTop: '5px',
					pointerEvents: state.open ? 'auto' : 'none',
				}}
				dir={props.language == 'ar' ? 'rtl' : 'ltr'}
			/>
		</div>
	);
}
