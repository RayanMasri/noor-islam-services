import React, { useState, useRef, useEffect } from 'react';
import { Menu as MUIMenu, IconButton, MenuItem } from '@mui/material';

export default function Menu(props) {
	// const john = useRef(null);

	// useEffect(() => {
	// 	if (!props.john) return;
	// 	john.current = document.querySelector(props.bon);
	// }, []);

	return (
		<div style={props.style}>
			{props.children}
			{/* {props.john} */}

			<MUIMenu
				// anchorEl={john.current}
				anchorEl={props.anchor}
				open={props.open}
				onClose={props.onClose}
				MenuListProps={{
					sx: {
						width: props.anchor ? props.anchor.offsetWidth : 0,
						...props.MenuListSx,
						// display: 'flex',
						// flexDirection: 'column',
						// alignItems: 'flex-end',
					},
				}}
				sx={props.sx}
			>
				{props.options.map((option, index) => {
					return (
						<MenuItem
							key={`option-${index}-${option.id}`}
							onClick={() => props.onChange(option.id)}
							className={props.selected == option.id ? 'menu-item-selected' : 'menu-item'}
							sx={{
								justifyContent: `flex-${props.dir == 'rtl' ? 'end' : 'start'} !important`,
							}}
						>
							{option.name}
						</MenuItem>
					);
				})}
				{/* <MenuItem onClick={props.onClose} sx={{}}>
					Profile
				</MenuItem>
				<MenuItem onClick={props.onClose}>My account</MenuItem>
				<MenuItem onClick={props.onClose}>Logout</MenuItem> */}
			</MUIMenu>
		</div>
	);
}
