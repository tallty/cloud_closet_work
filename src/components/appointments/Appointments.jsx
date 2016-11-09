/**
 * 预约清单
 */
import React, { Component } from 'react'
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { DateAppointments } from './DateAppointments'
import SuperAgent from 'superagent'

export class Appointments extends Component {
	state = {
		appointments: []
	}

	componentWillMount() {
		let appointments = JSON.parse(sessionStorage.appointments)
		this.setState({ appointments: appointments })	
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
			<div className={css.appointments} id="appointments">
				<Toolbar title="预约清单"
								url="/" 
								style={toolbar_style} 
								back_style={back_style} />
				{ this.initList() }
			</div>
		)
	}
}
