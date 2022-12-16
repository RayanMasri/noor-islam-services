import React, { useState, useRef } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import { Button, Divider } from '@mui/material';

export default function ProductCard(props) {
	return (
		<div
			style={{
				position: 'relative',
				border: '1px solid #707070',
				backgroundColor: 'white',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				...props.style,
			}}
			className={props.className}
		>
			<img src={require('../icons/maarif-extended-logo.svg').default} className='product-card-image'></img>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					textAlign: 'center',
				}}
				className='product-card-name'
			>
				{props.title}
			</div>

			<Divider
				style={{
					width: '100%',
					backgroundColor: '#707070',
				}}
				className='product-card-name-divider'
			></Divider>

			<div
				style={{
					textAlign: 'right',
					width: '100%',
				}}
				className={`product-card-info${props.language == 'en' ? ' product-card-info-en' : ''}`}
			>
				{props.bulletpoints.map((info) => {
					return (
						<div
							className={`product-card-info-bulletpoint${props.language == 'en' ? ' product-card-info-bulletpoint-en' : ''}`}
							style={{
								flexDirection: props.language == 'ar' ? 'row-reverse' : 'row',
								textAlign: props.language == 'ar' ? 'right' : 'left',
							}}
						>
							<svg>
								<circle cx='50%' cy='50%' r='50%' fill='black'></circle>
							</svg>
							<div>{info}</div>
						</div>
					);
				})}
			</div>

			<Divider
				style={{
					width: '100%',
					backgroundColor: '#707070',
				}}
				className='product-card-name-divider'
			></Divider>

			<div
				style={{
					width: '100%',
					paddingRight: '15px',
					paddingLeft: '15px',
					boxSizing: 'border-box',
				}}
			>
				<Button
					disabled
					style={{
						backgroundColor: '#E3E3E3',
						width: '100%',
						borderRadius: '25px',
						position: 'relative',
					}}
				>
					<div
						style={{
							position: 'absolute',
							top: 0,
							height: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',

							paddingLeft: '15px',
							left: 0,
						}}
						className={props.language == 'ar' ? 'product-lock-icon-holder' : 'product-lock-icon-holder-en'}
					>
						<LockIcon className='product-lock-icon' sx={{ color: 'black' }}></LockIcon>
					</div>

					<div style={{ color: '#A45000', fontFamily: 'segoeui', textTransform: 'none' }} className='product-card-button-text'>
						{props.button}
					</div>
				</Button>
			</div>
		</div>
	);
}
