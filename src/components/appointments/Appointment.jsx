/**
 * 预约列表 - 详情
 */
import React, { Component } from 'react';
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { Spiner } from '../common/Spiner'
import { Link, withRouter } from 'react-router'
import SuperAgent from 'superagent'
import { Button, Timeline, Icon } from 'antd'

class Appointment extends Component {
	id = this.props.location.query.id
	state = {
		appointment: null,
		loading: false,
		error_text: null
	}

	componentDidMount() {
		SuperAgent
			.get(`http://closet-api.tallty.com/work/appointments/${this.id}`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					this.setState({ appointment: res.body })
				} else {
					this.setState({ appointment: {} })
					alert("获取预约详情失败");
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
		let appointment_str = JSON.stringify(this.state.appointment);
		sessionStorage.setItem('appointment', appointment_str);
	}

	/**
	 * 获取物流信息
	 */
	getLogistics() {
		let state = this.state.appointment.state;
		let states = ["用户预约","待确认","服务中","待付款","已支付","入库中","已上架"];
		let logistics = []
		
		if (state != "已取消") {
			for (let item of states) {
				if (state === item) break;
				logistics.push( <Timeline.Item key={item}>{item}</Timeline.Item> );
			}
		}

		logistics.push( 
			<Timeline.Item key={"active"}>
				<span style={{color: '#FD924B'}}>{state}</span>
			</Timeline.Item> 
		);

		return logistics;
	}

	/**
	 * 接单
	 */
	handleAccept() {
		this.setState({ loading: true });
		SuperAgent
			.post(`http://closet-api.tallty.com/work/appointments/${this.id}/accept`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					this.setState({appointment: res.body, loading: false});
				} else {
					this.setState({ error_text: "重新接单", loading: false });
				}
			})
	}

	/**
	 * 取消订单
	 */
	handleCancel() {
		SuperAgent
			.post(`http://closet-api.tallty.com/work/appointments/${this.id}/cancel`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					console.log("已取消");
					this.setState({ appointment: res.body });
				} else {
					this.setState({ error_text: "重新取消", loading: false });
				}
			})
	}

	/**
	 * 开始录入
	 */
	handleRecord() {
		this.props.router.replace(`/warehouse?appointment_id=${this.id}`);
	}

	/**
	 * 工作人员代付
	 */
	handleWorkerPay() {
		alert("POS机支付");
	}

	/**
	 * 工作人员送入仓库后，开始入库登记时确认
	 */
	handleConfirmStoring() {
		SuperAgent
			.post(`http://closet-api.tallty.com/work/appointments/${this.id}/storing`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					console.log("工作人员送入仓库后，确认入库登记");
					this.setState({ appointment: res.body });
				} else {
					this.setState({ error_text: "重新确认", loading: false });
				}
			})
	}

	/**
	 * 返回首页
	 */
	handleBackHome() {
		this.props.router.replace('/');
	}

	/**
	 * 不同状态的按钮事件
	 */
	handleEvent() {
		switch(this.state.appointment.state) {
			case "待确认":
				return this.handleAccept();
				break;
			case "服务中":
				return this.handleRecord();
				break;
			case "待付款":
				return this.handleWorkerPay();
				break;
			case "已支付":
				return this.handleConfirmStoring();
				break;
			default:
				return this.handleBackHome();
				break;
		}
	}

	/**
	 * 显示不同状态下的按钮文字
	 */
	getBtnText() {
		if (this.state.error_text){
			return this.state.error_text; 
		} 
		switch(this.state.appointment.state) {
			case "待确认":
				return "确认接单";
				break;
			case "服务中":
				return "开始录入";
				break;
			case "待付款":
				return "POS机支付";
				break;
			case "已支付":
				return "确认入库";
				break;
			default:
				return "返回首页";
				break;
		}
	}


	setDetail() {
		let { appointment } = this.state;
		if (appointment === null) {
			return <Spiner />
		} else if (appointment === -1) {
			return null
		} else {
			let photo_path = appointment.photo ? appointment.photo : "src/images/default_photo.svg"
			return (
				<div >
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

						<div className={css.timeline}>
							<Timeline>
								{this.getLogistics()}
					    </Timeline>
						</div>
					</div>
					
					<Button className={css.warehouse} 
									loading={this.state.loading}
									onClick={this.handleEvent.bind(this)}>{this.getBtnText()}</Button>
				</div> 
			)
		}
	}

	render() {
		let toolbar_style = {
			background: '#ECC17D', 
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

export default withRouter(Appointment);
