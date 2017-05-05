/**
 * 预约列表 - 详情
 */
import React, { Component } from 'react';
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { Spiner } from '../common/Spiner'
import { Link, withRouter } from 'react-router'
import SuperAgent from 'superagent'
import { Button, Row, Col } from 'antd';
import StateUserInfo from '../user_info/StateUserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';

class Appointment extends Component {
  state = {
    appointment: null,
    loading: false,
    error_text: null
  }

  componentWillMount() {
    const { id } = this.props.location.query;
    SuperAgent
      .get(`http://closet-api.tallty.com/worker/appointments/${id}?random=${Math.random()}`)
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          this.setState({ appointment: res.body })
        } else {
          this.setState({ appointment: {} })
        }
      })
  }

  componentDidUpdate(prevProps, prevState) {
    // 缓存appointment
    sessionStorage.setItem('appointment', JSON.stringify(this.state.appointment));
  }

  /**
   * 获取当期订单的状态
   */
  getStates() {
    const nextStates = new Map([
      ['待确认', '录入'],
      ['服务中', '付款'],
      ['待付款', '入库'],
      ['已支付', '入库'],
      ['入库中', '上架'],
      ['已上架', '']
    ])
    const state = this.state.appointment.state;
    return [state, nextStates.get(state)];
  }

  /**
 * 显示不同状态下的按钮文字
 */
  getBtnText() {
    if (this.state.error_text) {
      return this.state.error_text;
    }
    switch (this.state.appointment.state) {
      case '待确认':
        return '确认接单';
      case '服务中':
        return '添加入库清单';
      case '待付款':
        return '取消订单';
      case '已支付':
        return '确认入库';
      default:
        return '返回首页';
    }
  }

  /**
   * 取消订单
   */
  handleCancel() {
    SuperAgent
      .post(`http://closet-api.tallty.com/worker/appointments/${this.props.location.query.id}/cancel`)
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          this.setState({ appointment: res.body });
        } else {
          this.setState({ error_text: "重新取消", loading: false });
        }
      })
  }

  /**
   * 开始录入
   */
  handleRecord() {
    this.props.router.replace(`/warehouse?appointment_id=${this.props.location.query.id}`);
  }

  /**
   * 工作人员送入仓库后，开始入库登记时确认
   */
  handleConfirmStoring() {
    SuperAgent
      .post(`http://closet-api.tallty.com/worker/appointments/${this.props.location.query.id}/storing`)
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          this.setState({ appointment: res.body });
        } else {
          this.setState({ error_text: '重新确认', loading: false });
        }
      })
  }

  /**
   * 在线充值
   */
  handleRecharge() {
    const { appointment } = this.state;
    this.props.router.replace(`/recharge?user_id=${appointment.user_id}`);
  }

  /**
   * 不同状态的按钮事件
   */
  handleEvent() {
    switch (this.state.appointment.state) {
      case '待确认':
        return this.handleAccept();
      case '服务中':
        return this.handleRecord();
      case '待付款':
        return this.handleCancel();
      case '已支付':
        return this.handleConfirmStoring();
      default:
        this.props.router.replace('/');
        break;
    }
    return null;
  }

  /**
   * 接单
   */
  handleAccept() {
    this.setState({ loading: true });
    SuperAgent
      .post(`http://closet-api.tallty.com/worker/appointments/${this.props.location.query.id}/accept`)
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          this.setState({ appointment: res.body, loading: false });
          this.props.router.replace(`/warehouse?appointment_id=${this.props.location.query.id}`);
        } else {
          this.setState({ error_text: '重新接单', loading: false });
        }
      })
  }

  /**
   * 显示订单信息：
   * 1、预约信息
   * 2、入库衣服信息
   */
  showAppointmentInfo(appointment) {
    return appointment.appointment_price_groups.length === 0 ?
      <div className={css.appoint_info}>
        <p className={css.time_count}>预约时间：{appointment.date}</p>
        <p className={css.time_count}>预约件数：{appointment.number} 件</p>
      </div> :
      <div className={css.order}>
        <ClothesTable groups={appointment.appointment_price_groups} />
        <div className={css.clothes_numebr}>
          <p className={css.title}>种类件数</p>
          <Row>
            <Col span={8}>
              <img src="/src/images/icon_fold.svg" alt="图标" /> 叠放 <span>{appointment.garment_count_info.stacking}</span> 件
            </Col>
            <Col span={8}>
              <img src="/src/images/icon_hang.svg" alt="图标" /> 挂放 <span>{appointment.garment_count_info.hanging}</span> 件
            </Col>
            <Col span={8}>
              <img src="/src/images/icon_dress.svg" alt="图标" /> 礼服 <span>{appointment.garment_count_info.full_dress}</span> 件
            </Col>
          </Row>
        </div>
        <Row className={css.tips}>
          <Col span={12}>护理要求：&nbsp;&nbsp;<span>{appointment.care_type}</span></Col>
          <Col span={12} className="text-right">护理费：{appointment.care_cost}</Col>
        </Row>
        <p className="text-right">服务费：{appointment.service_cost}</p>
        <p className={css.total_price}>合计：<span>{appointment.price}</span></p>
      </div>;
  }

  /**
   * 根据状态显示不同的操作按钮
   * 1、待确认 —— 确认接单
   * 2、服务中 —— 添加入库清单
   * 3、待付款 —— 【线下充值 | 修改订单 | 取消订单】
   * 4、已支付 —— 确认入库
   * 5、已入库 —— 返回首页
   * 6、已上架 —— 返回首页
   */
  showStateBtns(state) {
    const btns = (
      <div>
        <Button
          className={css.recharge_btn}
          onClick={this.handleRecharge.bind(this)}
        >
          线下充值
        </Button>
        <Button
          className={css.change_btn}
          onClick={this.handleRecord.bind(this)}
        >
          修改订单
        </Button>
        <Button
          className={css.main_btn}
          loading={this.state.loading}
          onClick={this.handleEvent.bind(this)}
        >
          {this.getBtnText()}
        </Button>
      </div>
    );
    const btn = (
      <div className={css.affix_bottom}>
        <Button
          className={css.main_btn}
          loading={this.state.loading}
          onClick={this.handleEvent.bind(this)}>
          {this.getBtnText()}
        </Button>
      </div>
    );
    return state === '待付款' ? btns : btn;
  }

  showAppointmentDetail() {
    const { appointment } = this.state;
    let dom;
    if (appointment === null) {
      dom = <Spiner />;
    } else {
      const states = this.getStates();
      const photoPath = appointment.photo ? appointment.photo : 'src/images/default_photo.svg'
      dom = (
        <div >
          <StateUserInfo
            nowState={states[0]}
            nextState={states[1]}
            user={appointment}
          />
          {this.showAppointmentInfo(appointment)}
          {this.showStateBtns(appointment.state)}
        </div>
      )
    }
    return dom;
  }

  render() {
    return (
      <div className={css.appointment}>
        <Toolbar title="预约详情" url="/appointments" />
        {this.showAppointmentDetail()}
      </div>
    );
  }
}

export default withRouter(Appointment);
