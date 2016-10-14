import React, { Component, PropTypes } from 'react'
import css from './pop_window.less'
import classNames from 'classnames/bind'

let cx = classNames.bind(css)

export class PopWindow extends Component {
	popStyle() {
		let className = null
		switch(this.props.direction) {
			case 'top':
				className = cx({
					top_window: true,
					toogle: this.props.show
				})
				break;
			case 'left':
				className = cx({
					left_window: true,
					toogle: this.props.show
				})
				break;
			case 'right':
				className = cx({
					right_window: true,
					toogle: this.props.show
				})
				break;
			case 'bottom':
				className = cx({
					bottom_window: true,
					toogle: this.props.show
				})
				break;
			default:
				className = cx({
					bottom_window: true,
					toogle: this.props.show
				})
		}
		return className
	}

	render() {
		const { show, onCancel } = this.props

		return (
			<div className={css.pop_bg} 
						style={{display: show ? 'block' : 'none'}} 
						onClick={this.props.onCancel}>
				<div className={this.popStyle()}>
					{this.props.children}
				</div>
			</div>
		)
	}
}

PopWindow.defaultProps = {
	show: false,
	direction: 'bottom',
	onCancel: () => {}
}

PopWindow.PropTypes = {
	show: PropTypes.bool,
	direction: PropTypes.string,
	onCancel: PropTypes.func
}