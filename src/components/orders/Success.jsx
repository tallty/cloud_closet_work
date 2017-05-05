/**
 * 预约清单 - 成功申请
 */
import React, { Component } from 'react'
import css from './order.less'
import { Link, withRouter } from 'react-router'

class Success extends Component {
  render() {
    const { status, action } = this.props.location.query;
    const appointmentId = this.props.location.query.appointment_id;
    return (
      <div className={css.appoint_success}>
        <div className={css.top_part}>
          <div className={css.tips}>
            <img src="/src/images/icon_success.svg" alt="success" />
            <h2>{status}</h2>
            {action === 'recharge' ? null : <p>请仔细核对订单货品，确保无误。</p>}
          </div>
        </div>
        <div className={css.bottom_part}>
          <div className={css.success_btns}>
            <Link to="/" className={css.btn_back}>返回列表</Link>
            {action === 'recharge' ? null : <Link to={`appointment?id=${appointmentId}`} className={css.btn_detail}>查看详情</Link>}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Success);
