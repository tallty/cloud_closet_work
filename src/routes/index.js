import React, { Component, PropTypes } from 'react'
import { Router, Route, IndexRoute, Link, Redirect } from 'react-router'
// 微信api相关功能
import auth from '../components/WechatConect/auth'
import {WechatConect} from '../components/WechatConect/WechatConect'
import GetOpenId from '../components/WechatConect/GetOpenId'
{/* 工作台 */}
import { Desk } from '../components/desk/Desk'
{/* 预约列表 */}
import { Appointments } from '../components/appointments/Appointments'
{/* 预约详情 */}
import { Appointment } from '../components/appointments/Appointment'
{/* 预约入库 */}
import { WareHouse } from '../components/warehouse/WareHouse'
{/* 展示订单 */}
import { AppointOrder } from '../components/appointments/AppointOrder'
{/* 订单完成-成功 */}
import { AppointSuccess } from '../components/appointments/AppointSuccess'

export class Routes extends Component {
  checkout(){
    if(auth.loggedIn() == true){

    }
  }

  requireAuth() {
    auth.loggedIn()
    if(sessionStorage.state != 'true'){
      console.log(sessionStorage.state)
      auth.getSkipUrl()
    }
  }

	render() {
		return (
			<Router history={this.props.history}>
        {/* 工作台 */}
        <Route path="/" component={Desk}/>
        {/* 预约清单 */}
        <Route path="/appointments" component={Appointments}/>
        {/* 预约详情 */}
        <Route path="/appointment" component={Appointment}/>
        {/* 预约入库 */}
        <Route path="/warehouse" component={WareHouse}/>
        {/* 预约清单 - 生成订单 */}
        <Route path="/appoint_order" component={AppointOrder}/>
        {/* 预约清单 - 入库成功 */}
        <Route path="/appoint_success" component={AppointSuccess}/>
		  </Router>
		)
	}
}

Routes.defaultProps = {
	
}

Routes.propTypes = {
  history: PropTypes.any,
}
