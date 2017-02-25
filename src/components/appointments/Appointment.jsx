/**
 * 预约列表 - 详情
 */
import React, { Component } from 'react';
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { Spiner } from '../common/Spiner'
import { Link, withRouter } from 'react-router'
import SuperAgent from 'superagent'
import { Button, Row, Col } from 'antd';
import StateUserInfo from '../user_info/StateUserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';

const nurseWay = new Map([
	['normal', '普通护理'],
	['senior', '高级护理'],
]);

class Appointment extends Component {
	id = this.props.location.query.id;
	state = {
		appointment: null,
		loading: false,
		error_text: null
	}

	componentWillMount() {
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
		let appointment_str = JSON.stringify(this.state.appointment);
		sessionStorage.setItem('appointment', appointment_str);
	}

	/**
	 * 获取当期订单的状态
	 */
	getStates() {
		const nextStates = {
			'待确认': '录入',
			'服务中': '付款',
			'待付款': '入库',
			'已支付': '入库',
			'入库中': '上架',
			'已上架': '',
		};
		let state = this.state.appointment.state;
		return [state, nextStates[state]];
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
	 * 在线充值
	 */
	handleRecharge() {
		alert('在线充值');
	}
	

	/**
	 * 不同状态的按钮事件
	 */
	handleEvent() {
		switch(this.state.appointment.state) {
			case "待确认":
				return this.handleAccept();
			case "服务中":
				return this.handleRecord();
			case "待付款":
				return this.handleCancel();
			case "已支付":
				return this.handleConfirmStoring();
			default:
				this.props.router.replace('/');
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
			case "服务中":
				return "添加入库清单";
			case "待付款":
				return "取消订单";
			case "已支付":
				return "确认入库";
			default:
				return "返回首页";
		}
	}

	/**
	 * 显示订单信息：
	 * 1、预约信息
	 * 2、入库衣服信息
	 */
	showAppointmentInfo(appointment) {
		return appointment.appointment_item_groups.length === 0 ? 
			<div className={css.appoint_info}>
				<p className={css.time_count}>预约时间：{appointment.date}</p>
				<p className={css.time_count}>预约件数：{appointment.number} 件</p>
			</div> : 
			<div className={css.order}>
				<ClothesTable groups={appointment.appointment_item_groups} />
				<Row className={css.tips}>
					<Col span={12}>护理要求：&nbsp;&nbsp;<span>{nurseWay.get(appointment.nurse)}</span></Col>
					<Col span={12} className="text-right">护理费：{appointment.nurse_charge}</Col>
				</Row>
				<p className="text-right">服务费：{appointment.service_charge}</p>
				<p className={css.total_price}>合计：<span>{ appointment.price }</span></p>
			</div>;
	}

	/**
	 * 根据状态显示不同的操作按钮
	 * 1、待确认 —— 确认接单
	 * 2、服务中 —— 添加入库清单
	 * 3、待付款 —— 【线下充值 | 修改订单 | 取消订单】
	 * 4、已支付 —— 确认入库
	 * 5、已入库 —— 返回首页
	 * 6、已上架 —— 返回首页
	 */
	showStateBtns(state) {
		const btns = (
			<div>
				<Button 
					className={css.recharge_btn}
					onClick={this.handleRecharge.bind(this)}>
					在线充值
				</Button>
				<Button 
					className={css.change_btn}
					onClick={this.handleRecord.bind(this)}>
					修改订单
				</Button>
				<Button 
					className={css.main_btn} 
					loading={ this.state.loading }
					onClick={ this.handleEvent.bind(this) }>
					{this.getBtnText()}
				</Button>
			</div>
		);
		const btn = (
			<div className={css.affix_bottom}>
				<Button 
					className={css.main_btn} 
					loading={ this.state.loading }
					onClick={ this.handleEvent.bind(this) }>
					{this.getBtnText()}
				</Button>
			</div>
		);
		return state === '待付款' ? btns : btn;
	}
	
	showAppointmentDetail() {
		const { appointment } = this.state;

		if (appointment === null) {
			return <Spiner />;
		} else {
			const states = this.getStates();
			let photo_path = appointment.photo ? appointment.photo : "src/images/default_photo.svg"
			return (
				<div >
					<StateUserInfo 
						nowState={ states[0] } 
						nextState={ states[1] }
						user={appointment} />

					{ this.showAppointmentInfo(appointment) }
					{ this.showStateBtns(appointment.state) }
				</div> 
			)
		}
	}

	render() {
		return (
			<div className={css.appointment}>
				<Toolbar title="预约详情" url="/appointments" />
				{ this.showAppointmentDetail() }		
			</div>
		);
	}
}

export default withRouter(Appointment);
