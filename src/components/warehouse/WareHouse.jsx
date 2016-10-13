/**
 * 预约入库
 */
import React, { Component, PropTypes } from 'react';
import css from './ware_house.less';
import { Link } from 'react-router';
import { UserInfo } from '../user_info/UserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';
import { Spiner } from '../common/Spiner'
import { Row, Col, Button, Radio } from 'antd';
import SuperAgent from 'superagent'
import WeUI from 'react-weui'
import 'weui'

const { ActionSheet } = WeUI
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export class WareHouse extends Component {
	state = {
		appointment: null,
		pop: false,
		data: [
			{
				kind: '上衣',
				season: '春夏',
				time_length: '3个月',
				count: 10,
				price: 20.0,
				total_price: 200.0
			},
			{
				kind: '连衣裙',
				season: '秋冬',
				time_length: '3个月',
				count: 18,
				price: 38.0,
				total_price: 684.0
			}
		]
	}

	menus = [{
    label: '选择时长',
    className: css.photo_item,
    onClick: this.hidePopWindow.bind(this)
  }, 
  {
    label: '选择数量',
    className: css.photo_item,
    onClick: this.hidePopWindow.bind(this)
  }]
	// 头像选择操作
  actions = [{
      label: '取消',
      className: css.photo_item,
      onClick: this.hidePopWindow.bind(this)
  },
  {
	  label: '添加',
    className: css.photo_item,
    onClick: this.addClothes.bind(this)
  }]


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

	onChange(e) {
		console.log(`radio checked:${e.target.value}`);
	}

	// 对话框关闭执行的事件，点击蒙层事件
	hidePopWindow() {
		this.setState({ pop: false })
		console.log("弹出框关闭了")
	}

	showPopWindow() {
		this.setState({ pop: true })
		console.log("弹出框显示了")
	}

	addClothes() {
		let _data = this.state.data
		_data.push({
			kind: '连衣裙',
			season: '秋冬',
			time_length: '3个月',
			count: 18,
			price: 38.0,
			total_price: 684.0
		})
		this.setState({ data: _data, pop: false })
	}

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
			array.push(
				<Col span={6} key={index}>
					<Button onClick={this.showPopWindow.bind(this)}>
						<img src={`src/images/${item[0]}.png`} alt={`${item[1]}`}/>
						<p>{item[1]}</p>
					</Button>
	      </Col>
			)
		})
		return array
	}

	render() {
		let appointment = this.state.appointment
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
					<RadioGroup onChange={this.onChange.bind(this)} defaultValue="spring_summer">
			      <RadioButton value="spring_summer">春夏</RadioButton>
			      <RadioButton value="fall_winter">秋冬</RadioButton>
			      <RadioButton value="winter">冬</RadioButton>
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
						<Col span={12}>护理要求：&nbsp;&nbsp;<span>每次护理</span></Col>
						<Col span={12} className="text-right">运费：xxx</Col>
					</Row>
					<p className="text-right">服务费：xxx</p>
					<p className={css.total_price}>合计：<span>884.0</span></p>
				</div>
				{/* 入库 */}
				<Link to="/work_appoint_order" className={css.tab_btn}>入库</Link>
				{/* popwindow */}
				<ActionSheet show={this.state.pop} 
										 menus={this.menus} 
										 actions={this.actions}
										 onRequestClose={this.hidePopWindow.bind(this)} />
			</div>
		);
	}
}

WareHouse.defaultProps = {

}

WareHouse.propTypes = {

}