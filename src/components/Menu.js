import React, { useState } from 'react';
import { Menu as MUIMenu, IconButton, MenuItem } from '@mui/material';

export default function Menu(props) {
	// const [anchorEl, setAnchorEl] = React.useState(null);

	// const handleClick = (event) => {
	// 	setAnchorEl(event.currentTarget);
	// };

	// const handleClose = () => {
	// 	setAnchorEl(null);
	// };

	return (
		<div>
			{props.children}

			<MUIMenu
				anchorEl={props.anchor}
				open={props.anchor != null}
				onClose={props.onClose}
				// PaperProps={{
				// 	style: props.style
				// }}
				// anchorOrigin={{
				// 	vertical: 'bottom',
				// 	horizontal: 'left',
				// }}
				transformOrigin={props.transformOrigin}
				sx={props.sx}
			>
				<MenuItem onClick={props.onClose}>Profile</MenuItem>
				<MenuItem onClick={props.onClose}>My account</MenuItem>
				<MenuItem onClick={props.onClose}>Logout</MenuItem>
			</MUIMenu>
		</div>
	);
}
