/**
 * 预约入库
 */
import React, { Component, PropTypes } from 'react';
import css from './ware_house.less';
import { Link } from 'react-router';
import { UserInfo } from '../user_info/UserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';
import { Spiner } from '../common/Spiner'
import { Row, Col, Button, Radio, Select, Input } from 'antd';
import SuperAgent from 'superagent'
import { PopWindow } from '../common/PopWindow'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formData = {
	length: 3,
	count: 10
}

export class WareHouse extends Component {
	state = {
		appointment: null,
		season: '春夏',
		kind: null,
		nurse: 'every',
		count: 10,
		pop: false,
		data: []
	}

	componentDidMount() {
		let apointment_id = this.props.location.query.appointment_id
		SuperAgent
			.get(`http://closet-api.tallty.com/appointments/${apointment_id}`)
			.set('Accept', 'application/json')
			.set('X-User-Token', sessionStorage.authentication_token)
			.set('X-User-Phone', sessionStorage.phone)
			.end((err, res) => {
				if (!err || err === null) {
					this.setState({ appointment: res.body })
				} else {
					alert("获取信息失败")
				}
			})
	}

	// 设置衣服种类
	setKinds() {
		let kinds = [
			["shangyi", "上衣"],
			["lianyiqun", "连衣裙"],
			["kuzhuang", "裤装"],
			["banqun", "半裙"],
			["waitao", "外套"],
			["yurongfu", "羽绒服"],
			["yongzhuang", "泳装"]
		]
		let array = []

		kinds.forEach((item, index, obj) => {
			let active = this.state.kind === item[1] ? css.active : null
			array.push(
				<Col span={6} key={index}>
					<Button onClick={this.showPopWindow.bind(this, item[1])} className={active}>
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
	showPopWindow(kind) {
		this.setState({ pop: true, kind: kind })
		console.log(`弹出框显示了, 选中${kind}`)
	}
	// 改变仓储时长
	onLengthChange(e) {
		formData.length = e.target.value
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
		let { appointment, season, kind, nurse, count, data } = this.state
		let _data = data
		_data.push({
			kind: kind,
			season: season,
			time_length: formData.length,
			count: count,
			price: 38.0,
			total_price: 684.0
		})
		this.setState({ data: _data, pop: false })
	}
	// 选择护理方式
	handleNurseChange(value) {
	  console.log(`selected ${value}`);
	  this.setState({ nurse: value })
	}

	render() {
		let { appointment, season, kind, nurse, count } = this.state

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
						<ClothesTable data={this.state.data} />
					</div>
				</div>

				{/* price */}
				<div className={css.tips_container}>
					<Row className={css.tips}>
						<Col span={12}>
							护理要求：
							<Select defaultValue={nurse} style={{ width: 90 }} 
											onChange={this.handleNurseChange.bind(this)}>
					      <Option value="every">每次护理</Option>
					      <Option value="one">一次护理</Option>
					      <Option value="no">不护理</Option>
					    </Select>
						</Col>
						<Col span={12} className="text-right">运费：xxx</Col>
					</Row>
					<p className="text-right">服务费：xxx</p>
					<p className={css.total_price}>合计：<span>884.0</span></p>
				</div>

				{/* 入库 */}
				<div className={css.btn_container}>
					<Link to="/work_appoint_order" className={css.tab_btn}>入库</Link>
				</div>

				{/* popwindow */}
				<PopWindow show={this.state.pop} direction='bottom' onCancel={this.hidePopWindow.bind(this)}>
					<div className={css.form}>
						<div className={css.content}>
							<div className={css.title}>{kind}</div>
							<div className={css.warehouse_length}>
								<p>仓储时长</p>
								<div className={css.radio_container}>
									<RadioGroup onChange={this.onLengthChange.bind(this)} defaultValue="三个月">
							      <RadioButton value="三个月">三个月</RadioButton>
							      <RadioButton value="六个月">六个月</RadioButton>
							      <RadioButton value="九个月">九个月</RadioButton>
							      <div style={{height: 10}}></div>
							      <RadioButton value="一年">一年</RadioButton>
							      <RadioButton value="两年">两年</RadioButton>
							    </RadioGroup>
								</div>
							</div>

							<div className={css.form_count}>
								<p>存衣数量</p>
								<div className={css.count_input}>
									<img src="src/images/reduce_icon.svg" alt="" onClick={this.reduceCount.bind(this)}/>
									<Input defaultValue="10" type="number" value={count} />
									<img src="src/images/add_icon.svg" alt="" onClick={this.addCount.bind(this)}/>
								</div>
							</div>

							<div className={css.actions}>
								<div className={css.btn}>
									<button onClick={this.hidePopWindow.bind(this)}>取消</button>
								</div>
								<div className={css.btn}>
									<button onClick={this.addClotheEvent.bind(this)}>确定</button>
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