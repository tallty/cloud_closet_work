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
	state = {
		appointment: null
	}


	componentDidMount() {
		let apointment_id = this.props.location.query.appointment_id
		SuperAgent
			.get(`http://closet-api.tallty.com/appointments/${apointment_id}`)
			.set('Accept', 'application/json')
			.set('X-User-Token', sessionStorage.authentication_token)
			.set('X-User-Phone', sessionStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					this.setState({ appointment: res.body })
					console.dir(res.body)
				} else {
					alert("获取信息失败")
				}
			})
	}

	render() {
		let { appointment } = this.state
		let toolbar_style = {
			background: '#FF9241', 
			color: '#fff'
		}
		let back_style = {
			color: '#fff'
		}
		let appointment_id = this.props.location.query.appointment_id

		return (
			<div className={css.appointment}>
				<Toolbar title="预约详情" 
								url="/appointments" 
								style={toolbar_style} 
								back_style={back_style} />

				<div className={css.div_one}></div>

				{
					appointment ?
					<div>
						<div className={css.div_two}>
							<img src="src/images/photo.png" alt="" className={css.photo}/>
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
							<p className={css.time_count}>预约件数：50 件</p>
						</div>
					</div> : 
					<Spiner />
				}
				<Link to={`/warehouse?appointment_id=${appointment_id}`} className={css.warehouse}>添加入库清单</Link>
			</div>
		);
	}
}
