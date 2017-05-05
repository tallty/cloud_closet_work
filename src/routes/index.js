import React, { Component, PropTypes } from 'react'
import { Router, Route, IndexRoute, Link, Redirect } from 'react-router'

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
    const token = localStorage.getItem('authentication_token');
    const phone = localStorage.getItem('phone');
    const lastTimeMillisecond = Number(localStorage.getItem('lastTime'));
    if (!(this.isInTime(lastTimeMillisecond) && phone && token)) {
      localStorage.removeItem('authentication_token');
      localStorage.removeItem('phone');
      localStorage.removeItem('lastTime');
      window.location.href = '/login';
    }
  }

  // judge time
  isInTime(lastTimeMillisecond) {
    const nowTimeMillisecond = (new Date).getTime();
    const interal = Math.round((nowTimeMillisecond - lastTimeMillisecond) / 86400000);
    return (interal <= 7);
  }

  render() {
    return (
      <Router history={this.props.history}>
        {/* 添加登陆路由 */}
        <Route path="/login" component={LogIn} />
        {/* 工作台 */}
        <Route path="/" component={Desk} onEnter={this.requireAuth.bind(this)} />
        {/* 预约清单 */}
        <Route path="/appointments" component={Appointments} onEnter={this.requireAuth.bind(this)} />
        {/* 预约详情 */}
        <Route path="/appointment" component={Appointment} onEnter={this.requireAuth.bind(this)} />
        {/* 预约入库 */}
        <Route path="/warehouse" component={WareHouse} onEnter={this.requireAuth.bind(this)} />
        {/* 预约清单 - 生成订单 */}
        <Route path="/order" component={Order} onEnter={this.requireAuth.bind(this)} />
        {/* 线下充值 */}
        <Route path="/recharge" component={Recharge} onEnter={this.requireAuth.bind(this)} />
        {/* 预约清单 - 入库成功 */}
        <Route path="/success" component={Success} onEnter={this.requireAuth.bind(this)} />
      </Router>
    )
  }
}

Routes.defaultProps = {

}

Routes.propTypes = {
  history: PropTypes.any
}
