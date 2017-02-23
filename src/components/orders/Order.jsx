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
import SuperAgent from 'superagent'

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
		let appointment_str = sessionStorage.appointment;
		let appointment = JSON.parse(appointment_str);

		this.setState({
			appointment: appointment
		})
	}

	/**
	 * [getTotalPrice 计算本次入库的总价格]
	 */
	getTotalPrice() {
		let {service_charge, nurse_charge, appointment_item_groups } = this.state.appointment
		// 入库衣服总价格(无运费、服务费)
		let total = 0
		appointment_item_groups.forEach((item, i, obj) => {
			total = total + item.total_price
		})

		return total + service_charge + nurse_charge;
	}

	/**
	 * 完成按钮点击逻辑
	 */
	handleClick() {
		// 封装更新的数据包
		let appointment = this.state.appointment;

		let cache = "";
		appointment.appointment_item_groups.forEach((item, index, obj) => {
			cache += `appointment_item[groups][][count]=${item.count}`;
			cache += `&appointment_item[groups][][price]=${item.price}`;
			cache += `&appointment_item[groups][][type_name]=${item.type_name}`;
			cache += `&appointment_item[groups][][season]=${item.season}`;
			cache += `&appointment_item[groups][][store_month]=${item.store_month}&`;
		});
		let params = cache.substring(0, cache.length -1);

		console.log(params)
		SuperAgent
			.put(`http://closet-api.tallty.com/work/appointments/${appointment.id}`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.send(params)
			.end((err, res) => {
				if (!err || err === null) {
					console.log(res);
					console.log("成功了");
					location.href = "/"
				} else {
					console.dir(err)
					console.log("失败了")
					alert("提交订单失败")
				}
			})
	}

	render() {
		let toolbar_style = {
			background: '#ECC17D', 
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
						<Col span={12} className="text-right">护理费：{appointment.nurse_charge}</Col>
					</Row>
					<p className="text-right">服务费：{appointment.service_charge}</p>
					<p className={css.total_price}>合计：<span>{ appointment.price }</span></p>
					<p>配送时间：2016-5-28 12:00～13:00</p>
				</div>

				<hr/>
				<UserInfo name={appointment.name} photo={appointment.photo} phone={appointment.phone} />
				<hr/>

				<Link to={`/warehouse?appointment_id=${appointment.id}`} className={css.modify_order_btn}>修改订单</Link>
				<button className={css.submit_order_btn} onClick={this.handleClick.bind(this)}>确认订单</button>
			</div>
		)
	}
}
