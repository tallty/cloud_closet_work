import React, { Component } from 'react';

export class SmartLifeBanner extends Component {

	getImg() {
		let style = {
			width: '100%',
			display: 'block'
		}
		let action = this.props.location.query.action
  	if (action === "healthy") {
			return <img src="src/images/healthy.jpg" style={style} alt=""/>;
  	} else if (action === "sport") {
			return <img src="src/images/sport.jpg" style={style} alt=""/>;
  	}
  }

	render() {
		return (
			<div>{this.getImg()}</div>
		);
	}
}
