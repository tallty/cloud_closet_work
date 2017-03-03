import React, { Component, PropTypes } from 'react';
import css from './appoint.less';
import { Affix } from 'antd';
import { Link } from 'react-router';
import { UserInfo } from '../user_info/UserInfo';
import classNames from 'classnames/bind';

const cx = classNames.bind(css);

export class DateAppointments extends Component {
  // 预约时间解析
  parseTime(time) {
    // 清单预约时间
    let _time = new Date(time);
    let _time_year = _time.getFullYear();
    let _time_month = _time.getMonth() + 1;
    let _time_day = _time.getDate();
    // 当期时间
    let now_time = new Date();
    let now_year = now_time.getFullYear();
    let now_month = now_time.getMonth() + 1;
    let now_day = now_time.getDate();
    // 返回值
    let return_time = `${_time_year}-${_time_month}-${_time_day}`
    // 优化相邻几天的显示情况
    if (now_year === _time_year && now_month === _time_month) {
      switch (now_day - _time_day) {
        case 0:
          return_time = `今天 (${return_time})`;
          break;
        case 1:
          return_time = `昨天 (${return_time})`;
          break;
        case 2:
          return_time = `前天 (${return_time})`;
          break;
        case -1:
          return_time = `明天 (${return_time})`;
          break;
        case -2:
          return_time = `后天 (${return_time})`;
          break;
      }
    }
    return return_time;
  }

  // 初始化列表
  initList() {
    let list = []
    this.props.items.forEach((item, index, obj) => {
      let tag_css = cx({
        tag: true,
        tag_storing: item.state === '入库中',
        tag_service: item.state === '服务中',
        tag_payment: item.state === '待付款',
        tag_canceled: item.state === '已取消',
        tag_paied: item.state === '已支付'
      });
      list.push(
        <Link to={`/appointment?id=${item.id}`} className={css.item} key={index}>
          <UserInfo name={item.name} clothe_count={item.number} phone={item.phone} created_at={item.created_at}>
            <div className={tag_css}>{item.state}</div>
          </UserInfo>
          <div className={css.item_footer}>
            <img src="src/images/address_icon.svg" alt="icon" />
            <span>{item.address}</span>
          </div>
        </Link>
      )
    })
    return list
  }

  // 初始化列表头
  initHeader() {
    return this.props.date ?
            <Affix offsetTop={50} target={() => document.getElementById('appointments')}>
              <div className={css.item_header}>{ this.parseTime(this.props.date) }</div>
            </Affix> : null
  }

  render() {
    return (
      <div>
        { this.initHeader() }
        { this.initList() }
      </div>
    )
  }
}

DateAppointments.defaultProps = {
  date: null,
  items: [],
}

DateAppointments.PropTypes = {
  date: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      address: PropTypes.string,
      name: PropTypes.string,
      phone: PropTypes.string,
      number: PropTypes.number,
      date: PropTypes.string,
      created_at: PropTypes.string,
    }),
  ),
}