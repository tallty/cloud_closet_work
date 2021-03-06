import React, { Component, PropTypes } from 'react'
import { Router, Route, IndexRoute, Link, Redirect } from 'react-router'

// 微信api相关功能
import auth from '../components/WechatConect/auth'
import GetOpenId from '../components/WechatConect/GetOpenId'
/* 登录 */
import { LogIn } from '../components/log_in/LogIn'
/* 工作台 */
import Desk from '../components/desk/Desk'
/* 预约列表 */
import { Appointments } from '../components/appointments/Appointments'
/* 预约详情 */
import Appointment from '../components/appointments/Appointment'
/* 预约入库 */
import WareHouse from '../components/warehouse/WareHouse'
/* 展示订单 */
import { Order } from '../components/orders/Order'
/* 订单完成-成功 */
import Success from '../components/orders/Success'
// 线下充值
import Recharge from '../components/appointments/Recharge';

export class Routes extends Component {
  // 接收鉴权
  requireAuth() {
    auth.loggedIn();
  }

  render() {
    return (
      <Router history={this.props.history}>
        {/* 添加登陆路由 */}
        <Route path="/login" component={LogIn} />
        {/* 获取用户openid */}
        <Route path="/get_open_id" component={GetOpenId} />
        {/* 工作台 */}
        <Route path="/" component={Desk} />
        {/* 预约清单 */}
        <Route path="/appointments" component={Appointments} />
        {/* 预约详情 */}
        <Route path="/appointment" component={Appointment} />
        {/* 预约入库 */}
        <Route path="/warehouse" component={WareHouse} />
        {/* 预约清单 - 生成订单 */}
        <Route path="/order" component={Order} />
        {/* 线下充值 */}
        <Route path="/recharge" component={Recharge} />
        {/* 预约清单 - 入库成功 */}
        <Route path="/success" component={Success} />
      </Router>
    )
  }
}

Routes.defaultProps = {

}

Routes.propTypes = {
  history: PropTypes.any
}
