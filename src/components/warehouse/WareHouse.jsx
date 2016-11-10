/**
 * 预约入库
 * 进入时：读取 sessionStorage.appointment
 * 点击入库时：更新 sessionStorage.appointment
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
 * 	price: 订单的合计总价,
 * 	seq: 预约的订单号,
 * 	state: 订单的状态【服务中, ...】
 * 	detail: "[["上衣", "5"], ["裤装", "2"], ["裙装", "3"]]",
 * 	created_at: 订单的创建时间,
 * 	【=============欠缺=================】
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
 * 			price: 单条记录的总价,
 * 			type_name: 衣服类别,
 * 			【===============欠缺================】
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
import { ClotheKinds } from './ClotheKinds';
import { Spiner } from '../common/Spiner';
import { Toolbar } from '../common/Toolbar';
import { Row, Col, Button, Radio, Select, Input } from 'antd';
import { PopWindow } from '../common/PopWindow';
import SuperAgent from 'superagent';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
// 记录点击表格条目的对象
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
		appointment: null,	// 服务的订单对象
		types: [],					// 所有衣服类型
		pop: false,					// 弹框控制
		event: null,				// 事件：【新增 | 编辑】
		_type_name: null, 	// 选择的类型
		_count: 1,					// 存衣数量
		_store_month: 3,		// 存储时长
		_price: 0, 					// 衣服类型的单价
		_season: '春夏',			// 季别
	}

	componentWillMount() {
		// 取得缓存本地的 appointment 清单
		let local_appointment = sessionStorage.appointment
		let data = JSON.parse(local_appointment)
		let appointment = this.parseAppointment(data)
		console.log("========local appointment===========")
		console.dir(appointment)

		this.setState({ appointment: appointment });
		this.getTypes();
	}

	// 解析【appointment】数据
	parseAppointment(data) {
		// 整理成需要的对象（因为接口字段还不完整）
		let { id, name, phone, address, number, date, price, seq, state, detail, created_at, appointment_item_groups } = data;
		let groups = [];
		// 用户信息
		let appointment = {
			id: id,
			name: name,
			phone: phone,
			address: address,
			number: number,
			date: date,
			price: price,
	 		seq: seq,
	  	state: state,
			detail: detail,
			created_at: created_at,
			nurse: 'every', // 欠缺
			freight: 10, // 欠缺
 			service_charge: 50 // 欠缺
		};
		// 入库记录
		appointment_item_groups.forEach((item, index, obj) => {
			let _price = item.price / item.count / item.store_month;
			groups.push({
				id: item.id,
				count: item.count,
				store_month: item.store_month,
				price: item.price,
				type_name: item.type_name,
				season: '春夏', // 欠缺
				_per_price: Math.round(_price, -1)
			});
		});
		appointment.appointment_item_groups = groups;
		return appointment;
	}

	/**
	 * [getTypes 获取衣服种类的列表]
	 */
	getTypes() {
		SuperAgent
			.get('http://closet-api.tallty.com/work/price_systems')
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.authentication_token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					let types = res.body.price_systems;
					console.dir(types);
					this.setState({types: types});
				} else {
					console.log("获取衣服种类失败")
					this.setState({types: []});
				}
			})
	}

	// 选择季节
	onSeasonChange(e) {
		console.log(`季节改变:${e.target.value}`);
		this.setState({ _season: e.target.value })
	}

	/**
	 * [selectClotheType 显示弹出窗]
	 * @param  {[object]} item [选择的衣服种类、价格]
	 */
	selectClotheType(item) {
		console.log(`弹出框显示了, 选中: ${item.name}`)
		this.setState({ 
			pop: true, 
			event: NEW,
			_type_name: item.name,
			_price: item.price,
			_count: 1,
			_store_month: 3
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
		let { _season, _type_name, _count, _store_month, _price, appointment } = this.state;
		// 预约对象
		let _appointment = appointment;
		let _total_price = _count * _store_month * _price;

		// 增加一条入库记录
		_appointment.appointment_item_groups.push({
			id: null,
			type_name: _type_name,
			season: _season,
			store_month: _store_month,
			count: _count,
			price: _total_price,
			_per_price: _price
		});
		// 更新订单合计
		_appointment.price = this.getTotalPrice(_appointment);

		this.setState({ 
			appointment: _appointment,
			pop: false
		});

		console.log("添加一类衣服条目 =>");
		console.dir(_appointment);
	}

	// 更新列表中的衣服信息
	updateClotheEvent() {
		let { _season, _type_name, _count, _store_month, _price, appointment } = this.state;
		// 预约对象
		let _appointment = appointment;
		// 更新的条目
		let item = _appointment.appointment_item_groups[editItem.index];
		let _total_price = _count * _store_month * _price;

		// 如果更新后的数量为0， 则删除条目
		if (_count === 0) {
			_appointment.appointment_item_groups.splice(editItem.index, 1)
		} else {
			item.kind = _type_name;
			item.count = _count;
			item.store_month = _store_month;
			item.price = _total_price;
		}
		// 更新订单合计
		_appointment.price = this.getTotalPrice(_appointment);

		this.setState({ 
			appointment: _appointment,
			_count: 1,
			pop: false
		});

		console.log("更新后的appointment对象 =>");
		console.dir(appointment);
	}

	/**
	 * [getTotalPrice 计算本次入库的总价格]
	 */
	getTotalPrice(appointment) {
		let { freight, service_charge, appointment_item_groups } = appointment;
		// 入库衣服总价格(无运费、服务费)
		let total = 0;
		appointment_item_groups.forEach((item, i, obj) => {
			total = total + item.price;
		});
		return total + freight + service_charge;
	}


	/**
	 * [handleGroupClick 【存衣数量】列表的点击事件]
	 * @param  {[type]} index [点击的条目在appointment.appointment_item_groups中的索引]
	 * @param  {[type]} item  [点击的条目对象]
	 */
	handleGroupClick(index, item) {
		console.log("你点击了第"+index+"个条目，=>");
		console.log(item);

		editItem.item = item;
		editItem.index = index;

		this.setState({
			_type_name: item.type_name,
			_store_month: item.store_month,
			_count: item.count,
			_price: item._per_price,
			pop: true,
			event: EDIT
		});

		console.log("点击的更新时长"+item.store_month);
	}

	/**
	 * [handleWarehouse 入库生成订单逻辑]
	 * @return {[type]} [description]
	 */
	handleWarehouse() {
		let appointment_str = JSON.stringify(this.state.appointment);
		//存入storage
		sessionStorage.appointment = appointment_str;
		sessionStorage.setItem('appointment', appointment_str);
		console.log("把【appointment】存入sessionStorage");
		// 读取
		let appo = sessionStorage.appointment;
		console.dir(JSON.parse(appo));
		this.props.router.replace(`order?appointment_id=${this.appointment_id}`)
	}

	/**
	 * [handleNurseChange 选择护理方式]
	 * @param  {[string]} value [选择的护理方式]
	 */
	handleNurseChange(value) {
	  console.log(`选择的护理方式： ${value}`);
	  let _appointment = this.state.appointment;
		_appointment.nurse = value;
	  this.setState({ appointment: _appointment });
	}

	render() {
		// toolbar 样式
		let toolbar_style = {
			background: '#FF9241', 
			color: '#fff'
		};
		let back_style = {
			color: '#fff'
		};
		// 状态
		let { appointment, types, pop, event, _season, _type_name, _count, _store_month } = this.state;
		// 按钮点击性
		let disabled = appointment.appointment_item_groups.length <= 0;

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
				<ClotheKinds kinds={types} handleClick={this.selectClotheType.bind(this)}/>

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
						<Col span={18}>
							护理要求：
							<Select defaultValue={appointment.nurse} style={{ width: 90 }} 
											onChange={this.handleNurseChange.bind(this)}>
					      <Option value="every">每次护理</Option>
					      <Option value="one">一次护理</Option>
					      <Option value="no">不护理</Option>
					    </Select>
						</Col>
						<Col span={6} className="text-right">运费：{appointment.freight}</Col>
					</Row>
					<p className="text-right">服务费：{appointment.service_charge}</p>
					<p className={css.total_price}>合计：<span>{ appointment.price }</span></p>
				</div>

				{/* 入库 */}
				<div className={css.btn_container}>
					<Button disabled={disabled}
									className={css.tab_btn} 
									onClick={this.handleWarehouse.bind(this)}>
									入库
					</Button>
				</div>

				{/* popwindow */}
				<PopWindow show={pop} direction='bottom' onCancel={this.hidePopWindow.bind(this)}>
					<div className={css.pop_content}>
						<div className={css.title}>{_type_name}</div>
						{/* 仓储时长 */}
						<div className={css.warehouse_length}>
							<p>仓储时长</p>
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

						{/* 存衣数量 */}
						<div className={css.form_count}>
							<p>存衣数量</p>
							<div className={css.count_input}>
								<Button className={css.count_button} onClick={this.reduceCount.bind(this)}>
									<img src="src/images/reduce_icon.svg" alt="-"/>
								</Button>
			          <Input type="number" disabled={true} value={`${_count}`} />
			          <Button className={css.count_button} onClick={this.addCount.bind(this)}>
			          	<img src="src/images/add_icon.svg" alt="+"/>
			          </Button>
							</div>
						</div>
						{/* 操作 */}
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