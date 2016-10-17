/**
 * 预约入库
 * 进入时：读取 localStorage.appointment
 * 点击入库时：更新 localStorage.appointment
 */

/**
 * 需要的数据类型：
 * appointment: {
 * 	id: 用户id,
 * 	name: 用户姓名,
 * 	phone: 手机号,
 * 	address: 地址,
 * 	number: 预约入库数量,
 * 	date: 预约日期,
 * 	_total: 衣服总计,
 * 	【====以下为接口欠缺数据字段，使用假数据===】
 * 	nurse: 护理方式[every|one|no],
 *	freight: 运费,
 *	service_charge: 服务费,
 *	photo: 头像,
 * 	【==================================】
 * 	appointment_item_groups: [
 * 	  {
 * 			id: 条目id,
 * 			count: 衣服数量,
 * 			store_month: 仓储时长（月）,
 * 			price: 单价价格（接口显示的总价，需自行计算）,
 * 			total_price: 单条入库记录总价,
 * 			【======以下为接口欠缺数据字段，使用假数据====】
 * 			kind: 衣服类别,
 * 			season: 季别
 * 			【==================================】
 * 	  }
 * 	]
 * }
 */
import React, { Component, PropTypes } from 'react';
import css from './ware_house.less';
import { withRouter } from 'react-router';
import { UserInfo } from '../user_info/UserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';
import { ClotheKinds } from './ClotheKinds'
import { Spiner } from '../common/Spiner'
import { Toolbar } from '../common/Toolbar'
import { Row, Col, Button, Radio, Select, Input } from 'antd';
import { PopWindow } from '../common/PopWindow'
import SuperAgent from 'superagent'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
// 点击表格条目的对象
const editItem = {
	index: null,
	item: null
};
// 入库列表操作事件类别：
const NEW = 'new';
const EDIT = 'edit';

class WareHouse extends Component {
	appointment_id = this.props.location.query.appointment_id
	state = {
		appointment: null,
		kinds: [],
		pop: false,
		event: null,
		_season: '春夏',
		_kind: null,
		_count: 1,
		_store_month: 3,
		_price: 0
	}

	componentWillMount() {
		// 取得缓存本地的 appointment 清单
		let local_appointment = localStorage.appointment
		let data = JSON.parse(local_appointment)
		let appointment = this.parseAppointment(data)
		console.log("========local appointment===========")
		console.dir(appointment)

		let kinds = [
			{ id: 1, name: "上衣", price: 8 },
			{ id: 2, name: "连衣裙", price: 12},
			{ id: 3, name: "裤装", price: 8 },
			{ id: 4, name: "半裙", price: 5 },
			{ id: 5, name: "外套", price: 10 },
			{ id: 6, name: "羽绒服", price: 15 },
			{ id: 7, name: "泳装", price: 8 }
		]
		this.setState({
			appointment: appointment,
			kinds: kinds
		})
	}

	// 解析【appointment】数据
	parseAppointment(data) {
		// 整理成需要的对象（因为接口字段还不完整）
		let { id, name, phone, address, number, date, appointment_item_groups } = data
		let groups = []
		// 用户信息
		let appointment = {
			id: id,
			name: name,
			phone: phone,
			address: address,
			number: number,
			date: date,
			nurse: 'every',
			freight: 10,
 			service_charge: 50
		}
		// 入库记录
		appointment_item_groups.forEach((item, index, obj) => {
			let _price = item.price / item.count / item.store_month
			groups.push({
				id: item.id,
				kind: '上衣',
				season: '春夏',
				count: item.count,
				store_month: item.store_month,
				price: Math.round(_price, -1),
				total_price: item.price
			})
		})
		appointment.appointment_item_groups = groups
		return appointment
	}

	// 选择季节
	onSeasonChange(e) {
		console.log(`季节改变:${e.target.value}`);
		this.setState({ _season: e.target.value })
	}

	/**
	 * [showPopWindow 显示弹出窗]
	 * @param  {[object]} item [选择的衣服种类、价格]
	 */
	showPopWindow(item) {
		console.log(`弹出框显示了, 选中: ${item.name}`)
		this.setState({ 
			pop: true, 
			event: NEW,
			_kind: item.name,
			_price: item.price
		})
	}

	/**
	 * [hidePopWindow 弹出窗关闭执行的事件]
	 */
	hidePopWindow() {
		console.log("弹出框关闭了")
		this.setState({ pop: false })
	}

	/**
	 * [onLengthChange 改变仓储时长]
	 * @param  {[node]} e [选择的radio按钮]
	 */
	onLengthChange(e) {
		console.log("选择的时长：" + e.target.value)
		let length = parseInt(e.target.value)
		this.setState({
			_store_month: length
		})
	}
	
	/**
	 * [reduceCount 减少衣服数量]
	 */
	reduceCount() {
		let count = this.state._count
		if (count > 0) {
			count -= 1
			this.setState({_count: count})
		}
	} 

	/**
	 * [addCount 增加衣服数量]
	 */
	addCount() {
		let count = this.state._count
		count += 1
		this.setState({_count: count})
	}

	// 添加衣服到列表
	addClotheEvent() {
		let { _season, _kind, _count, _store_month, _price, appointment } = this.state
		// 预约对象
		let _appointment = appointment
		let _total_price = _count * _store_month * _price

		// 增加一条入库记录
		_appointment.appointment_item_groups.push({
			id: null,
			kind: _kind,
			season: _season,
			store_month: _store_month,
			count: _count,
			price: _price,
			total_price: _total_price
		})

		this.setState({ 
			appointment: _appointment,
			pop: false,
		})

		console.log("添加一类衣服条目 =>")
		console.dir(_appointment)
	}

	// 更新列表中的衣服信息
	updateClotheEvent() {
		let { _season, _kind, _count, _store_month, _price, appointment } = this.state
		// 预约对象
		let _appointment = appointment
		// 更新的条目
		let item = _appointment.appointment_item_groups[editItem.index]
		let _total_price = _count * _store_month * _price

		// 如果更新后的数量为0， 则删除条目
		if (_count === 0) {
			_appointment.appointment_item_groups.splice(editItem.index, 1)
		} else {
			item.kind = _kind
			item.count = _count
			item.store_month = _store_month
			item.total_price = _total_price
		}

		this.setState({ 
			appointment: _appointment,
			_count: 1,
			pop: false
		})

		console.log("更新后的appointment对象 =>")
		console.dir(appointment)
	}

	/**
	 * [handleGroupClick 【存衣数量】列表的点击事件]
	 * @param  {[type]} index [点击的条目在appointment.appointment_item_groups中的索引]
	 * @param  {[type]} item  [点击的条目对象]
	 */
	handleGroupClick(index, item) {
		console.log("你点击了第"+index+"个条目，=>")
		console.log(item)

		editItem.item = item
		editItem.index = index

		this.setState({
			_kind: item.kind,
			_store_month: item.store_month,
			_count: item.count,
			_price: item.price,
			pop: true,
			event: EDIT
		})

		console.log("点击的更新时长"+item.store_month)
	}

	/**
	 * [handleWarehouse 入库生成订单逻辑]
	 * @return {[type]} [description]
	 */
	handleWarehouse() {
		let appointment_str = JSON.stringify(this.state.appointment);
		//存入storage
		localStorage.appointment = appointment_str;
		localStorage.setItem('appointment', appointment_str);
		console.log("把【appointment】存入localStorage")
		// 读取
		let appo = localStorage.appointment
		console.dir(JSON.parse(appo))
		this.props.router.replace(`order?appointment_id=${this.appointment_id}`)
	}

	/**
	 * [handleNurseChange 选择护理方式]
	 * @param  {[string]} value [选择的护理方式]
	 */
	handleNurseChange(value) {
	  console.log(`选择的护理方式： ${value}`);
	  let _appointment = this.state.appointment
		_appointment.nurse = value
	  this.setState({ appointment: _appointment })
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
		// toolbar 样式
		let toolbar_style = {
			background: '#FF9241', 
			color: '#fff'
		}
		let back_style = {
			color: '#fff'
		}
		// 状态
		let { appointment, kinds, _season, _kind, _count, _store_month, pop, event } = this.state

		return (
			<div className={css.container}>
				<Toolbar title="预约入库" 
									url={`/appointment?id=${this.appointment_id}`}
									style={toolbar_style} 
									back_style={back_style} />
				{/* 用户信息 */}
				<UserInfo name={appointment.name} 
									photo={appointment.photo} 
									phone={appointment.phone} />
				
				{/* 季款 */}
				<div className={css.season}>
					<span>季款：&nbsp;&nbsp;</span>
					<RadioGroup onChange={this.onSeasonChange.bind(this)} 
											defaultValue="春夏"
											value={_season}>
			      <RadioButton value="春夏">春夏</RadioButton>
			      <RadioButton value="秋冬">秋冬</RadioButton>
			      <RadioButton value="冬">冬</RadioButton>
			    </RadioGroup>
				</div>

				{/* 衣服种类 */}
				<ClotheKinds kinds={kinds} handleClick={this.showPopWindow.bind(this)}/>

				{/* 存衣数量 */}
				<div className={css.pane}>
					<div className={css.pane_header}>存衣数量</div>
					<div className={css.pane_body}>
						<ClothesTable groups={appointment.appointment_item_groups} itemClickEvent={this.handleGroupClick.bind(this)} />
					</div>
				</div>

				{/* price */}
				<div className={css.tips_container}>
					<Row className={css.tips}>
						<Col span={12}>
							护理要求：
							<Select defaultValue={appointment.nurse} style={{ width: 90 }} 
											onChange={this.handleNurseChange.bind(this)}>
					      <Option value="every">每次护理</Option>
					      <Option value="one">一次护理</Option>
					      <Option value="no">不护理</Option>
					    </Select>
						</Col>
						<Col span={12} className="text-right">运费：{appointment.freight}</Col>
					</Row>
					<p className="text-right">服务费：{appointment.service_charge}</p>
					<p className={css.total_price}>合计：<span>{ this.getTotalPrice() }</span></p>
				</div>

				{/* 入库 */}
				<div className={css.btn_container}>
					<button className={css.tab_btn} onClick={this.handleWarehouse.bind(this)}>入库</button>
				</div>

				{/* popwindow */}
				<PopWindow show={pop} direction='bottom' onCancel={this.hidePopWindow.bind(this)}>
					<div className={css.form}>
						<div className={css.content}>
							<div className={css.title}>{_kind}</div>
							<div className={css.warehouse_length}>
								<p>仓储时长{_store_month}</p>
								<div className={css.radio_container}>
									<RadioGroup onChange={this.onLengthChange.bind(this)} 
															value={`${this.state._store_month}`}
															defaultValue="3">
								    <RadioButton value="3">三个月</RadioButton>
								    <RadioButton value="6">六个月</RadioButton>
								    <RadioButton value="9">九个月</RadioButton>
								    <div style={{height: 10}}></div>
								    <RadioButton value="12">一年</RadioButton>
								    <RadioButton value="24">两年</RadioButton>
								  </RadioGroup>
								</div>
							</div>

							<div className={css.form_count}>
								<p>存衣数量</p>
								<div className={css.count_input}>
									<img src="src/images/reduce_icon.svg" onClick={this.reduceCount.bind(this)} alt="-"/>
									<Input defaultValue="1" type="number" disabled={true} value={_count} />
									<img src="src/images/add_icon.svg" onClick={this.addCount.bind(this)} alt="+"/>
								</div>
							</div>

							<div className={css.actions}>
								<div className={css.btn}>
									<button onClick={this.hidePopWindow.bind(this)}>取消</button>
								</div>
								<div className={css.btn}>
									{
										event === NEW ? 
											<button onClick={this.addClotheEvent.bind(this)}>确定</button> : 
											<button onClick={this.updateClotheEvent.bind(this)}>更新</button>
									}
								</div>
							</div>
						</div>
					</div>
				</PopWindow>
			</div>
		);
	}
}

WareHouse.defaultProps = {

}

WareHouse.propTypes = {

}

export default withRouter(WareHouse);