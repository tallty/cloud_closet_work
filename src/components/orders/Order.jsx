/**
 * 预约清单 - 生成订单
 */
import React, { Component } from 'react'
import css from './order.less'
import { Toolbar } from '../common/Toolbar'
import { Spiner } from '../common/Spiner'
import { Link } from 'react-router'
import { UserInfo } from '../user_info/UserInfo'
import { ClothesTable } from '../clothes_table/ClothesTable'
import { Row, Col } from 'antd'

const nurseWay = new Map([
	['every', '每次护理'],
	['one', '一次护理'],
	['no', '不护理']
]);

export class Order extends Component {
	state = {
		appointment: null
	}

	componentWillMount() {
		let appointment_str = localStorage.appointment
		let appointment = JSON.parse(appointment_str)

		this.setState({
			appointment: appointment
		})
	}

	/**
	 * [getTotalPrice 计算本次入库的总价格]
	 */
	getTotalPrice() {
		let { freight, service_charge, appointment_item_groups } = this.state.appointment
		// 入库衣服总价格(无运费、服务费)
		let total = 0
		appointment_item_groups.forEach((item, i, obj) => {
			total = total + item.count * item.store_month * item.price
		})

		return total + freight + service_charge
	}

	render() {
		let toolbar_style = {
			background: '#FF9241', 
			color: '#fff'
		}
		let back_style = {
			color: '#fff'
		}

		let { appointment } = this.state

		return (
			<div className={css.appoint_order}>
				<Toolbar title="预约清单" 
								url={`/warehouse?appointment_id=${appointment.id}`}
								style={toolbar_style} 
								back_style={back_style} />

				<div className={css.order}>
					<ClothesTable groups={appointment.appointment_item_groups} />
					<Row className={css.tips}>
						<Col span={12}>护理要求：&nbsp;&nbsp;<span>{nurseWay.get(appointment.nurse)}</span></Col>
						<Col span={12} className="text-right">运费：{appointment.freight}</Col>
					</Row>
					<p className="text-right">服务费：{appointment.service_charge}</p>
					<p className={css.total_price}>合计：<span>{ this.getTotalPrice() }</span></p>
					<p>配送时间：2016-5-28 12:00～13:00</p>
				</div>

				<hr/>
				<UserInfo name={appointment.name} photo={appointment.photo} phone={appointment.phone} />
				<hr/>

				<Link to={`/warehouse?appointment_id=${appointment.id}`} className={css.modify_order_btn}>修改订单</Link>
				<Link to="/success" className={css.submit_order_btn}>完成</Link>
			</div>
		)
	}
}
