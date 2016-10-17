/**
 * 预约清单
 */
import React, { Component } from 'react'
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { Spiner } from '../common/Spiner'
import { DateAppointments } from './DateAppointments'
import SuperAgent from 'superagent'

export class Appointments extends Component {
	state = {
		appointments: null
	}

	componentDidMount() {
		SuperAgent
			.get('http://closet-api.tallty.com/work/appointments')
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					let appointments = res.body.appointments
					this.setState({ appointments: appointments })	
				} else {
					alert("获取信息失败")
					this.setState({ appointments: [] })
				}
			})
	}
	
	initList() {
		let list = []
		this.state.appointments.forEach((dateItems, index, obj) => {
			list.push(
				<DateAppointments date={dateItems.date} items={dateItems.items} key={index} />
			)
		})
		return list
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
			<div>
				<Toolbar title="预约清单" 
								url="/" 
								style={toolbar_style} 
								back_style={back_style} />
				<div className={css.appointments}>
					{ this.state.appointments ? this.initList() : <Spiner/> }
				</div>
			</div>
		)
	}
}
