import React, { Component, PropTypes } from 'react'
import css from './user_info.less'

export class UserInfo extends Component {
	
	getPhoto() {
		if (this.props.photo.length > 0) {
			return this.props.photo
		} else {
			return 'src/images/default_photo.png'
		}
	}

	getItem() {
		const { name, phone, count } = this.props

		if (this.props.clothe_count > 0) {
			return (
				<div className={css.content_left}>
					<p className={css.count_user_info}>
						<span className={css.name}>{name}</span>
						<a className={css.phone}>
							<img src="src/images/phone_icon.svg" alt="icon"/>
							{phone}
						</a>
					</p>
					<p className={css.count}>预约件数：50件</p>
				</div>
			)
		} else {
			return (
				<div className={css.content_left}>
					<p>用户：&nbsp;&nbsp;<span>{name}</span></p>
					<p>电话：&nbsp;&nbsp;<span>{phone}</span></p>
				</div>
			)
		}
	}

	render() {
		return (
			<div className={css.item_content}>
				{this.getItem()}
				<div className={css.content_right}>
					<img src={this.getPhoto()} alt="头像"/>
				</div>
			</div>
		)
	}
}

UserInfo.defaultProps = {
	name: '',
	phone: '',
	photo: '',
	clothe_count: 0
}

UserInfo.PropTypes = {
	name: PropTypes.string,
	phone: PropTypes.string,
	photo: PropTypes.string,
	clothe_count: PropTypes.number
}