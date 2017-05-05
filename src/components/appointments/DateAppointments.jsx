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
    const localTime = new Date(time);
    const localTimeYear = localTime.getFullYear();
    const localTimeMonth = localTime.getMonth() + 1;
    const localTimeDay = localTime.getDate();
    // 当期时间
    const nowTime = new Date();
    const nowYear = nowTime.getFullYear();
    const nowMonth = nowTime.getMonth() + 1;
    const nowDay = nowTime.getDate();
    // 返回值
    let returnTime = `${localTimeYear}-${localTimeMonth}-${localTimeDay}`;
    // 优化相邻几天的显示情况
    if (nowYear === localTimeYear && nowMonth === localTimeMonth) {
      switch (nowDay - localTimeDay) {
        case 0:
          returnTime = `今天 (${returnTime})`;
          break;
        case 1:
          returnTime = `昨天 (${returnTime})`;
          break;
        case 2:
          returnTime = `前天 (${returnTime})`;
          break;
        case -1:
          returnTime = `明天 (${returnTime})`;
          break;
        case -2:
          returnTime = `后天 (${returnTime})`;
          break;
        default:
          break;
      }
    }
    return returnTime;
  }

  // 初始化列表
  initList() {
    const list = []
    this.props.items.forEach((item, index, obj) => {
      let tagCss = cx({
        tag: true,
        tag_storing: item.state === '入库中' || item.state === '待确认',
        tag_service: item.state === '服务中',
        tag_payment: item.state === '待付款',
        tag_canceled: item.state === '已取消',
        tag_paied: item.state === '已支付'
      });
      list.push(
        <Link to={`/appointment?id=${item.id}`} className={css.item} key={index}>
          <UserInfo appointment={item}>
            <div className={tagCss}>{item.state}</div>
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
        <div className={css.item_header}>{this.parseTime(this.props.date)}</div>
      </Affix> : null;
  }

  render() {
    return (
      <div>
        {this.initHeader()}
        {this.initList()}
      </div>
    )
  }
}

DateAppointments.defaultProps = {
  date: null,
  items: []
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
      created_at: PropTypes.string
    }),
  )
}
