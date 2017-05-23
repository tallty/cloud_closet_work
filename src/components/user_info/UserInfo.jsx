import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import css from './user_info.less';

export class UserInfo extends Component {

  getPhoto() {
    if (this.props.appointment) {
      return this.props.appointment.user_avatar;
    } else {
      return 'src/images/default_photo.png'
    }
  }

  getItem() {
    const { name, phone, number, created_at, seq } = this.props.appointment;
    if (this.props.clothe_count != -1) {
      return (
        <div className={css.content_left}>
          <p className={css.count_user_info}>
            <span className={css.name}>{name}</span>
            <span className={css.phone}>
              <img src="src/images/phone_icon.svg" alt="icon" />
              {phone}
            </span>
          </p>
          <p className={css.count}>预约件数：{this.showAppointmentNumber(number)} 件</p>
          <p className={css.count}>下单时间：{this.formatDate(created_at)}</p>
          <p className={css.count}>订单编号：{seq}</p>
        </div>
      )
    } else {
      return (
        <div className={css.content_left}>
          <p>用户：&nbsp;&nbsp;<span>{name}</span></p>
          <p>电话：&nbsp;&nbsp;<span>{phone}</span></p>
        </div>
      )
    }
  }

  // 数量范围描述数据存到数据库时，可删除此方法
  showAppointmentNumber(number) {
    switch (number) {
      case 10:
        return '5-20';
      case 30:
        return '20-50';
      case 50:
        return '大于50';
      default:
        return number;
    }
  }

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  render() {
    return (
      <div className={css.item_content}>
        {this.getItem()}
        <div className={css.content_right}>
          {
            this.props.appointment.user_avatar ? <img src={this.getPhoto()} alt="头像" /> : this.props.children
          }
        </div>
      </div>
    )
  }
}

UserInfo.defaultProps = {
  name: '',
  phone: '',
  photo: null,
  number: -1,
  created_at: '',
  seq: ''
}

UserInfo.PropTypes = {
  name: PropTypes.string,
  phone: PropTypes.string,
  photo: PropTypes.string,
  number: PropTypes.number,
  created_at: PropTypes.string,
  seq: PropTypes.string
}
