/**
 * 预约入库
 */
import React, { Component, PropTypes } from 'react';
import css from './ware_house.less';
import { UserInfo } from '../user_info/UserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';
import { Spiner } from '../common/Spiner'
import { Row, Col, Button, Radio, Select, Input } from 'antd';
import SuperAgent from 'superagent'
import { PopWindow } from '../common/PopWindow'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const editItem = {
	index: null,
	item: null
};
const parseLength = new Map([
	[3, '三个月'],
	[6, '六个月'],
	[9, '九个月'],
	[12, '一年'],
	[24, '两年']
]);

export class WareHouse extends Component {
	appointment_id = this.props.location.query.appointment_id
	state = {
		appointment: null,
		season: '春夏',
		kinds: [],
		kind: null,
		count: 10,
		length: 3,
		price_cache: 0,
		clothes: {
			data: [],
			nurse: 'every',
			total: 0,
			freight: 10,
			service_charge: 50
		},
		pop: false,
		event: null
	}

	componentWillMount() {
		let event = this.props.location.query.event
		console.log(event)
		if (event === 'edit') {
			console.log("begin")
			let clothes_str = localStorage.clothes
			let clothes = JSON.parse(clothes_str)

			if (clothes) {
				console.log("state")
				this.setState({ clothes: clothes })
			}
		}
	}

	componentDidMount() {
		SuperAgent
			.get(`http://closet-api.tallty.com/appointments/${this.appointment_id}`)
			.set('Accept', 'application/json')
			.set('X-User-Token', localStorage.token)
			.set('X-User-Phone', localStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					// 以后可以通过接口获取衣服种类和单价
					let kinds = [
						["shangyi", "上衣", 8],
						["lianyiqun", "连衣裙", 12],
						["kuzhuang", "裤装", 8],
						["banqun", "半裙", 5],
						["waitao", "外套", 10],
						["yurongfu", "羽绒服", 15],
						["yongzhuang", "泳装", 8]
					]
					this.setState({ 
						appointment: res.body,
						kinds: kinds
					})
				} else {
					alert("获取信息失败")
				}
			})
	}

	// 设置衣服种类
	setKinds() {
		let array = []

		this.state.kinds.forEach((item, index, obj) => {
			let active = this.state.kind === item[1] ? css.active : null
			array.push(
				<Col span={6} key={index}>
					<Button onClick={this.showPopWindow.bind(this, item)} className={active}>
						<img src={`src/images/${item[0]}.png`} alt={`${item[1]}`}/>
						<p>{item[1]}</p>
					</Button>
	      </Col>
			)
		})
		return array
	}
	
	// 季节radio
	onSeasonChange(e) {
		console.log(`季节改变:${e.target.value}`);
		this.setState({ season: e.target.value })
	}

	// 对话框关闭执行的事件，点击蒙层事件
	hidePopWindow() {
		this.setState({ pop: false })
		console.log("弹出框关闭了")
	}

	// 显示popWindow
	showPopWindow(item) {
		this.setState({ 
			pop: true, 
			kind: item[1],
			price_cache: item[2],
			length: 3,
			count: 10,
			event: 'add'
		})
		console.log(`弹出框显示了, 选中${item[1]}`)
	}

	// 改变仓储时长
	onLengthChange(e) {
		let length = parseInt(e.target.value)
		this.setState({
			length: length
		})
		console.log("选择的时长：")
		console.log(e.target.value)
	}

	// 减少数量
	reduceCount() {
		let _count = this.state.count
		if (_count > 1) {
			_count -= 1
			this.setState({count: _count})
		}
	} 

	// 增加数量
	addCount() {
		let _count = this.state.count
		_count += 1
		this.setState({count: _count})
	}

	// 添加衣服到列表
	addClotheEvent() {
		let { season, kind, count, length, price_cache, clothes } = this.state
		let time_length = parseLength.get(length)
		// 总衣服对象
		let _clothes = clothes
		// 单类衣服的总价
		let total_price = length * count * price_cache
		// 入库衣服总价格(无运费、服务费)
		let _total = clothes.total + total_price

		console.log(length)
		console.log(time_length)

		let item = {
			kind: kind,
			season: season,
			length: time_length,
			count: count,
			price: price_cache,
			total_price: total_price
		}

		_clothes.data.push(item)
		_clothes.total = _total

		this.setState({ 
			pop: false,
			clothes: _clothes
		})
	}

	// 更新列表中的衣服信息
	updateClotheEvent() {
		let { season, kind, count, length, price_cache, clothes } = this.state
		let item = clothes.data[editItem.index]
		let time_length = parseLength.get(length)
		// 单类总价
		let total_price = length * count * price_cache

		item.kind = kind
		item.count = count
		item.length = time_length
		item.total_price = total_price

		this.setState({ 
			clothes: clothes, 
			pop: false
		})

		this.getTotalPrice()
	}

	// 获取总价格
	getTotalPrice() {
		let { clothes } = this.state
		// 入库衣服总价格(无运费、服务费)
		let total = 0
		clothes.data.forEach((item, i, obj) => {
			total = total + item.total_price
		})
		clothes.total = total
		this.setState({ clothes: clothes })
		return total
	}

	// 衣服数量列表的点击事件
	onTableClickEvent(index, item) {
		console.log(index)
		console.log(item)

		editItem.item = item
		editItem.index = index

		this.setState({
			kind: item.kind,
			count: item.count,
			price_cache: item.price,
			pop: true,
			event: 'update'
		})
	}

	// 选择护理方式
	handleNurseChange(value) {
	  console.log(`selected ${value}`);
	  this.setState({ nurse: value })
	}

	// 入库逻辑
	handleWarehouse() {
		let clothes_str =JSON.stringify(this.state.clothes);
		let appointment_str = JSON.stringify(this.state.appointment)
		//存入storage
		localStorage.clothes = clothes_str;
		localStorage.appointment = appointment_str;
		console.log("把存衣数量列表、预约对象 存入localStorage")
		// 读取
		let str = localStorage.clothes
		let appo = localStorage.appointment
		console.dir(JSON.parse(str))
		console.dir(JSON.parse(appo))
		location.href = `order?appointment_id=${this.appointment_id}`;
	}

	render() {
		let { 
			appointment, 
			season, 
			kind,  
			count, 
			length, 
			clothes,
			pop,
			event
		} = this.state

		let pop_ok_event = event === 'add' ? 
												this.addClotheEvent.bind(this) :
												this.updateClotheEvent.bind(this)

		return (
			<div className={css.container}>
				{/* 用户信息 */}
				{
					appointment ? 
						<UserInfo name={appointment.name} photo="src/images/photo.png" phone={appointment.phone} />
						: <Spiner />
				}
				
				{/* 季款 */}
				<div className={css.season}>
					<span>季款：&nbsp;&nbsp;</span>
					<RadioGroup onChange={this.onSeasonChange.bind(this)} defaultValue={season}>
			      <RadioButton value="春夏">春夏</RadioButton>
			      <RadioButton value="秋冬">秋冬</RadioButton>
			      <RadioButton value="冬">冬</RadioButton>
			    </RadioGroup>
				</div>

				{/* 衣服种类 */}
				<div className={css.clothe_kind}>
					<Row>{this.setKinds()}</Row>
				</div>

				{/* 存衣数量 */}
				<div className={css.pane}>
					<div className={css.pane_header}>存衣数量</div>
					<div className={css.pane_body}>
						<ClothesTable data={clothes.data} itemClickEvent={this.onTableClickEvent.bind(this)} />
					</div>
				</div>

				{/* price */}
				<div className={css.tips_container}>
					<Row className={css.tips}>
						<Col span={12}>
							护理要求：
							<Select defaultValue={clothes.nurse} style={{ width: 90 }} 
											onChange={this.handleNurseChange.bind(this)}>
					      <Option value="every">每次护理</Option>
					      <Option value="one">一次护理</Option>
					      <Option value="no">不护理</Option>
					    </Select>
						</Col>
						<Col span={12} className="text-right">运费：{clothes.freight}</Col>
					</Row>
					<p className="text-right">服务费：{clothes.service_charge}</p>
					<p className={css.total_price}>合计：<span>{clothes.total + clothes.service_charge + clothes.freight}</span></p>
				</div>

				{/* 入库 */}
				<div className={css.btn_container}>
					<button className={css.tab_btn} onClick={this.handleWarehouse.bind(this)}>入库</button>
				</div>

				{/* popwindow */}
				<PopWindow show={pop} direction='bottom' onCancel={this.hidePopWindow.bind(this)}>
					<div className={css.form}>
						<div className={css.content}>
							<div className={css.title}>{kind}</div>
							<div className={css.warehouse_length}>
								<p>仓储时长</p>
								<div className={css.radio_container}>
									<RadioGroup onChange={this.onLengthChange.bind(this)} defaultValue={`${length}`}>
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
									<img src="src/images/reduce_icon.svg" alt="" onClick={this.reduceCount.bind(this)}/>
									<Input defaultValue="10" type="number" disabled={true} value={count} />
									<img src="src/images/add_icon.svg" alt="" onClick={this.addCount.bind(this)}/>
								</div>
							</div>

							<div className={css.actions}>
								<div className={css.btn}>
									<button onClick={this.hidePopWindow.bind(this)}>取消</button>
								</div>
								<div className={css.btn}>
									<button onClick={pop_ok_event}>确定</button>
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