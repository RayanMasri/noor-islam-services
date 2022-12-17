import React, { useState, useRef } from 'react';
import Menu from 'components/Menu.js';
import SelectMenu from 'components/SelectMenu.js';
import { IconButton, Button, Divider } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import PublicIcon from '@mui/icons-material/Public';
import { useMainContext } from 'contexts/MainContext.jsx';
// TODO: remove main context if unnecessary

import { useNavigate } from 'react-router-dom';

const LANGUAGES = {
	'ar': 'عربي',
	'en': 'English',
};

export default function Header(props) {
	const navigate = useNavigate();
	const { main, setMain } = useMainContext();
	let [state, setState] = useState({
		menu: null, // anchor element
		language: false,
	});
	const languageAnchor = useRef(null);

	return (
		<div
			className='header'
			style={{
				display: 'flex',
				justifyContent: 'center',
				flexDirection: 'column',
				boxSizing: 'border-box',
				alignItems: 'center',
				paddingTop: '10px',
				paddingBottom: '10px',
				width: '100%',
			}}
		>
			{/* <div
				id='inner-header'
				style={{
					width: '95%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					flexDirection: 'column',
				}}
			> */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					flexDirection: 'row-reverse',
					justifyContent: 'space-between',
					width: '100%',
					marginBottom: '5px',
				}}
			>
				<div
					className='menu-components'
					style={{
						display: 'flex',
						flexDirection: 'row-reverse',
					}}
				>
					<Menu
						// sx={{
						// 	marginLeft: '35px',
						// 	marginTop: '5px',
						// 	// transform: 'translateX(30%) translateY(',
						// }}
						transformOrigin={{
							horizontal: 'right',
						}}
						anchor={state.menu}
						onClose={() => setState({ ...state, menu: null })}
					>
						<div
							style={{
								backgroundColor: 'white',
								width: 'max-content',
								height: 'max-content',
								borderRadius: '5px',
							}}
						>
							<IconButton
								onClick={(event) => setState({ ...state, menu: event.currentTarget })}
								sx={{
									width: '36.5px',
									height: '36.5px',
								}}
							>
								<MenuIcon />
							</IconButton>
						</div>
					</Menu>

					<SelectMenu
						anchor={languageAnchor.current}
						open={state.language}
						// selected={main.language}
						selected={main.language}
						onClose={() => setState({ ...state, language: false })}
						onChange={(id) => {
							setState({
								...state,
								language: false,
							});
							setMain({
								...main,
								language: id,
							});

							localStorage.setItem('page-locale', id);
							props.onLanguageChange(id);
						}}
						options={Object.entries(LANGUAGES).map(([key, value]) => {
							return {
								id: key,
								name: value,
							};
						})}
						// sx={{
						// 	marginTop: '5px',
						// }}
						dir={main.language == 'ar' ? 'rtl' : 'ltr'}
					>
						<Button
							style={{
								backgroundColor: 'white',
								borderRadius: '5px',
								display: 'flex',
								flexDirection: main.language != 'ar' ? 'row' : 'row-reverse',
								justifyContent: 'space-between',
								alignItems: 'center',
								color: '#243162',
								width: '150px',
							}}
							ref={languageAnchor}
							onClick={(event) => setState({ ...state, language: true })}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: main.language != 'ar' ? 'row' : 'row-reverse',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<PublicIcon sx={{ color: '#243162', mx: '5px' }} />
								<div style={{ fontFamily: 'segoeui', color: '#243162', textTransform: 'none' }}>{LANGUAGES[main.language]}</div>
							</div>
							<KeyboardArrowDownIcon />
						</Button>
					</SelectMenu>
				</div>
				<IconButton
					sx={{
						width: '52px',
						height: '52px',
					}}
					onClick={() => navigate('/')}
				>
					<img src={require('../icons/noor-islam-filled.svg').default} width='48px' height='48px' />
				</IconButton>
			</div>
			<Divider style={{ width: '100%', backgroundColor: 'black' }} />
			{/* </div> */}
		</div>
	);
}
