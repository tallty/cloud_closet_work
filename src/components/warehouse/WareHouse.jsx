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
 * 	created_at: 订单的创建时间,
 * 	photo: 用户的头像
 * 	【=============欠缺=================】
 * 	nurse: 护理方式[normal | senior],
 *	service_charge: 服务费,
 *	nurse_charge: 护理费用,
 * 	【==================================】
 * 	appointment_item_groups: [
 * 	  {
 * 			id: 条目id,
 * 			count: 衣柜最大容量,
 * 			store_month: 仓储时长（月）,
 * 			price: 选择的衣柜的单价（元/月）,
 * 			type_name: 柜子的类别,
 * 	  }
 * 	]
 * }
 */
import React, { Component, PropTypes } from 'react';
import css from './ware_house.less';
import { withRouter } from 'react-router';
import { UserInfo } from '../user_info/UserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';
import { ClosetKinds } from './ClosetKinds';
import { Spiner } from '../common/Spiner';
import { Toolbar } from '../common/Toolbar';
import { Row, Col, Button, Radio, Select, Input, InputNumber } from 'antd';
import { PopWindow } from '../common/PopWindow';
import SuperAgent from 'superagent';
import CountEditer from './CountEditer';

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
	appointment_id = this.props.location.query.appointment_id;
	state = {
		appointment: null,			// 【Data】服务的订单对象
		types: [],							// 【Data】所有衣服类型
		loading: false,         // 【Logic】载入状态
		pop: false,							// 【Logic】弹框控制
		event: null,						// 【Logic】事件：【新增 | 编辑】
		_type_name: null, 			// 【Logic】选择的类型
		_count: 1,							// 【Logic】衣柜容量
		_store_month: 3,				// 【Logic】存储时长
		_price: 0, 							// 【Logic】衣柜的单价,
		_total: 0,              // 【Logic】订单的总价,
		_nurse_charge: 0,       // 【Logic】订单的护理费,
		_service_charge: 0,     // 【Logic】订单的服务费,
		_fold_count: 0,
		_hang_count: 0,
		_dress_count: 0,
	}

	componentWillMount() {
		// 取得缓存本地的 appointment 清单
		let local_appointment = sessionStorage.appointment;
		let data = JSON.parse(local_appointment);
		let appointment = this.parseAppointment(data);
		let total_price = this.getTotalPrice(appointment);
		this.setState({ 
			appointment: appointment,
			_total: total_price,
			_nurse_charge: appointment.nurse_charge,
			_service_charge: appointment.service_charge,
		});
		this.getTypes();
	}

	// 解析【appointment】数据
	parseAppointment(data) {	
		// 整理成需要的对象（因为接口字段还不完整）
		let { appointment_item_groups, nurse_charge, nurse } = data;
		let groups = appointment_item_groups;
		// 用户信息
		let appointment = {
			...data,
			nurse: nurse || 'normal', // 欠缺
 			service_charge: 50, // 欠缺
 			nurse_charge: nurse_charge || 0, // 欠缺
		};
		// 入库记录
		groups.map((item) => {
			let _price = item.price / item.count / item.store_month;
			return {
				...item,
				_per_price: Math.round(_price, -1),
			}
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
					this.setState({types: types});
				} else {
					console.log("获取衣服种类失败");
					this.setState({types: []});
				}
			})
	}

	/**
	 * [selectClotheType 显示弹出窗]
	 * @param  {[object]} type [选择的衣服种类、价格]
	 */
	selectClotheType(type) {
		console.log(`弹出框显示了, 选中: ${type.name}`);

		this.setState({ 
			pop: true, 
			event: NEW,
			_type_name: type.name,
			_price: type.price,
			_count: 60,
			_store_month: 3
		})
	}

	/**
	 * [hidePopWindow 弹出窗关闭执行的事件]
	 */
	hidePopWindow() {
		this.setState({ pop: false })
	}

	/**
	 * [handleCountChange] 处理数量改变
	 */
	handleCountChange(count) {
		this.setState({ _count: count });
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

	// 添加衣服到列表
	addClotheEvent() {
		let { _type_name, _count, _store_month, _price, _total, appointment } = this.state;
		_total += _store_month * _price;
		// 增加一条入库记录
		appointment.appointment_item_groups.push({
			id: null,
			type_name: _type_name,
			store_month: _store_month,
			count: _count,
			price: _price,
		});
		// 更新订单合计
		this.setState({ 
			appointment: appointment,
			pop: false,
			_total: _total,
		});
	}

	// 更新列表中的衣服信息
	updateClotheEvent() {
		let { _type_name, _count, _store_month, _price, appointment } = this.state;
		// 更新的条目
		let item = appointment.appointment_item_groups[editItem.index];
		// 如果更新后的数量为0， 则删除条目
		if (_count === 0) {
			appointment.appointment_item_groups.splice(editItem.index, 1)
		} else {
			item.kind = _type_name;
			item.count = _count;
			item.store_month = _store_month;
		}
		// 更新订单合计
		let total = this.getTotalPrice(appointment);
		this.setState({ 
			appointment: appointment,
			pop: false,
			_total: total,
		});
	}

	/**
	 * [getTotalPrice 计算本次入库的总价格]
	 */
	getTotalPrice(appointment) {
		let { appointment_item_groups } = appointment;
		// 入库衣服总价格(无运费、服务费)
		let total = 0;
		appointment_item_groups.forEach((item, i, obj) => {
			total = total + item.price * item.store_month;
		});
		return total;
	}

	/**
	 * [handleGroupClick 【衣柜记录】列表的点击事件]
	 * @param  {[type]} index [点击的条目在appointment.appointment_item_groups中的索引]
	 * @param  {[type]} item  [点击的条目对象]
	 */
	handleGroupClick(index, item) {
		editItem.item = item;
		editItem.index = index;
		this.setState({
			_type_name: item.type_name,
			_store_month: item.store_month,
			_count: item.count,
			_price: item.price,
			pop: true,
			event: EDIT
		});
	}

	/**
	 * [handleWarehouse 入库生成订单逻辑]
	 * @return {[type]} [description]
	 */
	handleWarehouse() {
		this.setState({ loading: true });
		// 缓存数据
		let { appointment, _nurse_charge, _service_charge } = this.state; 
		appointment.price = this.getAppointmentTotal();
		appointment.nurse_charge = _nurse_charge;
		appointment.service_charge = _service_charge;
		//存入storage
		let appointment_str = JSON.stringify(appointment);
		sessionStorage.setItem('appointment', appointment_str);
		// 开始提交，封装更新的数据包
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
				this.setState({ loading: false });
				if (!err || err === null) {
					this.props.router.replace(`success?appointment_id=${this.appointment_id}`);
				} else {
					alert("提交订单失败")
				}
			})
	}

	/**
	 * [handleNurseChange 选择护理方式]
	 * @param  {[string]} value [选择的护理方式]
	 */
	handleNurseChange(value) {
	  let _appointment = this.state.appointment;
		_appointment.nurse = value;
	  this.setState({ appointment: _appointment });
	}

	/**
	 * [handleNurseChargeInputChange 护理费输入处理]
	 * @param  {[type]} e [节点]
	 */
	handleNurseChargeInputChange(e) {
		this.setState({ _nurse_charge: e.target.value || '' });
	}

	/**
	 * [handleServiceChargeInput 服务费输入处理]
	 * @param  {[type]} e [节点]
	 */
	handleServiceChargeInputChange(e) {
		this.setState({ _service_charge: e.target.value || '' });
	}

	/**
	 * 处理不同种类衣服的数量
	 */
	handleKindClothesCount(kind, value) {
		console.log(value, kind);
		this.setState({ [kind]: value });
	}

	getAppointmentTotal() {
		let { _total, _nurse_charge, _service_charge } = this.state;
		_total = parseInt(_total) || 0;
		_nurse_charge = parseInt(_nurse_charge) || 0;
		_service_charge = parseInt(_service_charge) || 0;
		return _total + _nurse_charge + _service_charge;
	}

	render() {
		// 状态
		const { appointment, types, pop, loading, event, _type_name, _count, _store_month, _nurse_charge, _service_charge } = this.state;
		// 按钮点击性
		const disabled = appointment.appointment_item_groups.length <= 0;

		return (
			<div className={css.container}>
				<Toolbar title="预约入库" url={`/appointment?id=${this.appointment_id}`} />
				{/* 
				<UserInfo name={appointment.name} 
									photo={appointment.photo} 
									phone={appointment.phone} /> */}
				{/* 仓储类型 */}
				<ClosetKinds kinds={types} active={_type_name} handleClick={this.selectClotheType.bind(this)}/>
				{/* 衣柜记录 */}
				<div className={css.pane}>
					<div className={css.pane_header}>衣柜记录</div>
					<div className={css.pane_body}>
						<ClothesTable groups={appointment.appointment_item_groups} itemClickEvent={this.handleGroupClick.bind(this)} />
						{/* 种类件数 */}
						<p className={css.title}>种类件数</p>
						<Row>
							<Col xs={{span: 12}} sm={{span: 6}}>
								<div className={css.pane_input}>
									<img src="/src/images/icon_fold.svg" alt="fold"/>
									<span>叠放：</span>
									<InputNumber type="number" min={0} style={{ width: 60, borderColor: '#ECC17D' }} 
										value={this.state._fold_count}
										onChange={this.handleKindClothesCount.bind(this, '_fold_count')} />
									<span> 件 </span>
								</div>
							</Col>
							<Col xs={{span: 12}} sm={{span: 6}}>
								<div className={css.pane_input}>
									<img src="/src/images/icon_hang.svg" alt="fold"/>
									<span>挂放：</span>
									<InputNumber type="number" min={0} style={{ width: 60, borderColor: '#ECC17D' }}
										value={this.state._hang_count}
										onChange={this.handleKindClothesCount.bind(this, '_hang_count')} />
									<span> 件 </span>
								</div>
							</Col>
							<Col xs={{span: 12}} sm={{span: 6}}>
								<div className={css.pane_input}>
									<img src="/src/images/icon_dress.svg" alt="fold"/>
									<span>礼服：</span>
									<InputNumber type="number" min={0} style={{ width: 60, borderColor: '#ECC17D' }}
										value={this.state._dress_count}
										onChange={this.handleKindClothesCount.bind(this, '_dress_count')} />
									<span> 件 </span>
								</div>
							</Col>
						</Row>
					</div>
				</div>
				{/* price */}
				<div className={css.tips_container}>
					<Row>
						<Col sm={{span: 12}}>
							<div className={css.tips}>
								<span>护理要求：</span>
								<InputNumber 
									min={0}
									style={{ width: 75, borderColor: '#ECC17D' }} 
									onChange={this.handleNurseChargeInputChange.bind(this)}
									value={_nurse_charge}/>
								<span> 元 &nbsp;&nbsp;</span>
								<Select defaultValue={appointment.nurse} style={{ width: 90, marginBootom: 1 }} 
												onChange={this.handleNurseChange.bind(this)}>
						      <Option value="normal">普通护理</Option>
						      <Option value="senior">高级护理</Option>
						    </Select>
							</div>
						</Col>

						<Col sm={{span: 12}}>
							<div className={css.tips}>
								<span>服务费用：</span>
								<InputNumber 
									min={0}
									style={{ width: 75, borderColor: '#ECC17D' }} 
									onChange={ this.handleServiceChargeInputChange.bind(this) }
									value={_service_charge}/>
								<span> 元</span>
							</div>
						</Col>
					</Row>
					<p className={css.total_price}>合计：<span>{ this.getAppointmentTotal() }</span></p>
				</div>
				{/* 入库 */}
				<div className={css.btn_container}>
					<Button disabled={disabled}
									className={css.tab_btn} 
									loading={loading}
									onClick={this.handleWarehouse.bind(this)}>入库</Button>
				</div>
				{/* popwindow */}
				<PopWindow show={pop} direction='bottom' onCancel={ this.hidePopWindow.bind(this) }>
					<div className={css.pop_content}>
						<div className={css.title}>{_type_name}</div>
						{/* 仓储时长 */}
						<div className={css.warehouse_length}>
							<p>仓储时长</p>
							<div className={css.radio_container}>
								<RadioGroup 
									onChange={this.onLengthChange.bind(this)} 
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
						{/* 衣柜数量 */}
						<CountEditer defaultCount={1} onChange={this.handleCountChange.bind(this)} />
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