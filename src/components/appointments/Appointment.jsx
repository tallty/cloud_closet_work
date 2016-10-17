/**
 * 预约列表 - 详情
 */
import React, { Component } from 'react';
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { Spiner } from '../common/Spiner'
import { Link } from 'react-router'
import SuperAgent from 'superagent'

export class Appointment extends Component {
	id = this.props.location.query.id
	state = {
		appointment: null,
		clothes: {
			data: [],
			nurse: 'every',
			total: 0,
			freight: 10,
			service_charge: 50
		}
	}

	componentDidMount() {
		SuperAgent
			.get(`http://closet-api.tallty.com/work/appointments/${this.id}`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					this.setState({ appointment: res.body })
				} else {
					this.setState({ appointment: -1 })
					alert("获取预约详情失败")
				}
			})
	}

	componentDidUpdate(prevProps, prevState) {
		// 缓存appointment
		this.saveAppointmentToLocal();
	}

	/**
	 * [saveAppointmentToLocal 缓存数据]
	 */
	saveAppointmentToLocal() {
		let appointment_str = JSON.stringify(this.state.appointment)
		console.log("开始缓存数据 ===> " + appointment_str)
		localStorage.setItem('appointment', appointment_str)
	}

	setDetail() {
		let { appointment } = this.state

		if (appointment === null) {
			return <Spiner />
		} else if (appointment === -1) {
			return null
		} else {
			let photo_path = appointment.photo ? appointment.photo : "src/images/default_photo.png"
			return (
				<div>
					<div className={css.div_two}>
						<img src={photo_path} alt="" className={css.photo}/>
						<p className={css.name}>{appointment.name}</p>
						<a href={`tel:${appointment.phone}`} className={css.phone}>
							<img src="src/images/phone_icon.svg" alt=""/>
							<span>{appointment.phone}</span>
						</a>
					</div>
					<div className={css.div_three}>
						<p className={css.address}>
							<img src="src/images/address_icon.svg" alt=""/>
							<span>{appointment.address}</span>
						</p>
						<p className={css.time_count}>预约时间：{appointment.date}</p>
						<p className={css.time_count}>预约件数：{appointment.number} 件</p>
					</div>
					<Link to={`/warehouse?appointment_id=${this.id}`} className={css.warehouse}>添加入库清单</Link>
				</div> 
			)
		}
	}

	render() {
		let toolbar_style = {
			background: '#FF9241', 
			color: '#fff'
		}
		let back_style = {
			color: '#fff'
		}

		return (
			<div className={css.appointment}>
				<Toolbar title="预约详情" 
								url="/appointments" 
								style={toolbar_style} 
								back_style={back_style} />
				<div className={css.div_one}></div>
				{ this.setDetail() }				
			</div>
		);
	}
}
