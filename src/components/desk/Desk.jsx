/**
 * 工作台
 */
import React, { Component } from 'react'
import { Link, withRouter } from 'react-router'
import css from './desk.less'
import SuperAgent from 'superagent'

class Desk extends Component {
	state = {
		new_people: 0,
		total_people: 0,
		commited_appointments: [],
		accepted_appointments: [],
		unpaid_appointments: [],
		paid_appointments: [],
		storing_appointments: [],
		canceled_appointments: [],
		one_success: false,
		two_success: false
	}

	componentWillMount() {
    localStorage.setItem('state', 'true')
    localStorage.setItem('phone', '18516512221')
    localStorage.setItem('authentication_token', 'Q1yizX4Lg_b9yHzgKqDV')
	}

	componentDidMount() {
		this.getCommitedAppointments();
		this.getOtheAppointments();
	}

	getCommitedAppointments() {
		SuperAgent
			.get('http://closet-api.tallty.com//work/appointments')
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					let obj = res.body;
					console.log("获取【待确认】列表成功：");
					console.dir(obj);
					this.setState({ 
						commited_appointments: obj.appointments,
						new_people: obj.new_user_count_today,
						total_people: obj.user_count,
						one_success: true
					})
				} else {
					console.log("获取信息失败");
				}
			})
	}

	getOtheAppointments() {
		SuperAgent
			.get('http://closet-api.tallty.com//work/appointments/state_query')
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					let obj = res.body;
					console.log("获取不同状态列表成功：");
					console.dir(obj);
					this.setState({ 
						accepted_appointments: obj.accepted_appointments,
						unpaid_appointments: obj.unpaid_appointments,
						paid_appointments: obj.paid_appointments,
						storing_appointments: obj.storing_appointments,
						canceled_appointments: obj.canceled_appointments,
						two_success: true
					})
				} else {
					console.log("获取信息失败");
				}
			})
	}

	componentDidUpdate(prevProps, prevState) {
		// 缓存入库清单 appointments
		let appointments_str = JSON.stringify(this.state.commited_appointments)
		sessionStorage.setItem('appointments', appointments_str)
	}

	// 获取入库清单数量
	getAppointmentsCount(array) {
		let count = 0;
		for(let appointments of array) {
			for(let obj of appointments) {
				count += obj.items.length
			}
		}

		return count;
	}

	/**
	 * 处理点击
	 */
	handleClick(kind) {
		const { 
			commited_appointments, 
			accepted_appointments, 
			unpaid_appointments, 
			paid_appointments, 
			storing_appointments, 
			canceled_appointments,
			one_success,
			two_success
		} = this.state;

		if (!(one_success && two_success)) return null;

		if (kind === "预约入库") {
			let appointments_str = JSON.stringify(commited_appointments);
			sessionStorage.setItem('appointments', appointments_str);
		} else if (kind === "配送管理") {
			let array = accepted_appointments.concat(unpaid_appointments);
			array.concat(paid_appointments);
			console.dir(array);
			let appointments_str = JSON.stringify(array);
			sessionStorage.setItem('appointments', JSON.stringify(array));
		} else if (kind === "历史订单") {
			let array = storing_appointments.concat(canceled_appointments);
			console.dir(array);
			let appointments_str = JSON.stringify(array);
			sessionStorage.setItem('appointments', appointments_str);
		}
		this.props.router.replace('/appointments');
	}

	render() {
		const { 
			new_people, total_people, 
			commited_appointments, 
			accepted_appointments, 
			unpaid_appointments, 
			paid_appointments, 
			storing_appointments, 
			canceled_appointments 
		} = this.state;

		return (
			<div className={css.container}>
				<div className={css.top}>
					<div className={css.logo}>
						<img src="src/images/logo.svg" alt="logo"/>
					</div>
					<p className={css.name}>乐存好衣</p>
					<p className={css.company}>
						<span><img src="src/images/logo_icon.svg" alt=""/>&nbsp;上海市乐存好衣互联公司</span>
					</p>
					<div className={css.number}>
						<div className={css.new}>
							<p>新增人数</p>
							<p><span>{new_people}</span></p>
						</div>
						<div className={css.total}>
							<p>总用户数</p>
							<p><span>{total_people}</span></p>
						</div>
					</div>
				</div>
				<div className={css.bottom}>
					<div className={css.grid_container}>
						<div className={css.grid_item} onClick={this.handleClick.bind(this, '预约入库')}>
							<div>
								<h1>{this.getAppointmentsCount([commited_appointments])}</h1>
								<p>预约入库</p>
							</div>
						</div>

						<div className={css.grid_item} onClick={this.handleClick.bind(this, '配送管理')}>
							<div>
								<h1>{this.getAppointmentsCount([accepted_appointments,unpaid_appointments,paid_appointments])}</h1>
								<p>配送管理</p>
							</div>
						</div>

						<div className={css.grid_item} onClick={this.handleClick.bind(this, '历史订单')}>
							<div>
								<h1>{this.getAppointmentsCount([storing_appointments, canceled_appointments])}</h1>
								<p>历史订单</p>
							</div>
						</div>

						<div className={css.grid_item}>
							<div>
								<img src="src/images/notification.png" alt=""/>
								<p>VIP管理</p>
							</div>
						</div>

						<div className={css.grid_item}>
							<div></div>
						</div>

						<div className={css.grid_item}>
							<div>
								<img src="src/images/vip.png" alt=""/>
								<p>系统通知</p>
							</div>
							{/* <div className={css.red_dot}></div> */}
						</div>

						<div className={css.false_cell}> </div>
						<div className={css.false_cell}> </div>
						<div className={css.false_cell}> </div>
					</div>
				</div>
			</div>
		)
	}
}

export default withRouter(Desk);
