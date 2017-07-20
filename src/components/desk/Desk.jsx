import React, { Component } from 'react';
import { withRouter } from 'react-router';
import css from './desk.less';
import SuperAgent from 'superagent';

class Desk extends Component {
  state = {
    newPeople: 0,
    totalPeople: 0,
    commitedAppointments: [],
    acceptedAppointments: [],
    waitingAppointments: [],
    historyAppointments: [],
    oneSuccess: false,
    twoSuccess: false
  }

  componentDidMount() {
    this.getCommitedAppointments();
    this.getOtheAppointments();
  }

  componentDidUpdate(prevProps, prevState) {
    // 缓存入库清单 appointments
    const appointmentsStr = JSON.stringify(this.state.commitedAppointments)
    sessionStorage.setItem('appointments', appointmentsStr)
  }

  getCommitedAppointments() {
    SuperAgent
      .get('http://closet-api.tallty.com/worker/appointments')
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          const obj = res.body;
          this.setState({
            commitedAppointments: obj.appointments,
            newPeople: obj.new_user_count_today,
            totalPeople: obj.user_count,
            oneSuccess: true
          })
        } else {

        }
      })
  }

  getOtheAppointments() {
    SuperAgent
      .get('http://closet-api.tallty.com/worker/appointments/state_query')
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          const obj = res.body;
          this.setState({
            acceptedAppointments: obj.accepted_appointments,
            waitingAppointments: obj.waiting_appointments,
            historyAppointments: obj.history_appointments,
            twoSuccess: true
          })
        } else {

        }
      })
  }

  // 获取入库清单数量
  getAppointmentsCount(array) {
    let count = 0;
    for (const appointments of array) {
      for (const obj of appointments) {
        count += obj.items.length
      }
    }
    return count;
  }

  /**
   * 处理点击
   */
  handleClick(kind) {
    const {
      commitedAppointments,
      acceptedAppointments,
      waitingAppointments,
      historyAppointments,
      oneSuccess,
      twoSuccess
    } = this.state;

    if (!(oneSuccess && twoSuccess)) return null;

    let str = '';
    switch (kind) {
      case '待确认':
        str = JSON.stringify(commitedAppointments);
        break;
      case '待服务':
        str = JSON.stringify(acceptedAppointments);
        break;
      case '待入库':
        str = JSON.stringify(waitingAppointments);
        break;
      case '历史订单':
        str = JSON.stringify(historyAppointments);
        break;
      default:
        break;
    }
    sessionStorage.setItem('appointments', str);
    sessionStorage.setItem('appointmentsTitle', JSON.stringify(kind));
    this.props.router.replace('/appointments');
    return null;
  }

  render() {
    const {
      newPeople, totalPeople,
      commitedAppointments,
      acceptedAppointments,
      waitingAppointments,
      historyAppointments
    } = this.state;

    return (
      <div className={css.container}>
        <div className={css.top}>
          <div className={css.logo}>
            <img src="src/images/logo.svg" alt="logo" />
          </div>
          <p className={css.company}>
            <span><img src="src/images/logo_icon.svg" alt="" />&nbsp;乐存家庭服务（上海）有限公司</span>
          </p>
          <div className={css.number}>
            <div className={css.new}>
              <p>新增人数</p>
              <p><span>{newPeople}</span></p>
            </div>
            <div className={css.total}>
              <p>总用户数</p>
              <p><span>{totalPeople}</span></p>
            </div>
          </div>
        </div>
        <div className={css.bottom}>
          <div className={css.grid_container}>
            <div className={css.grid_item} onClick={this.handleClick.bind(this, '待确认')}>
              <div>
                <h1>{this.getAppointmentsCount([commitedAppointments])}</h1>
                <p>待确认</p>
              </div>
            </div>

            <div className={css.grid_item} onClick={this.handleClick.bind(this, '待服务')}>
              <div>
                <h1>{this.getAppointmentsCount([acceptedAppointments])}</h1>
                <p>待服务</p>
              </div>
            </div>

            <div className={css.grid_item} onClick={this.handleClick.bind(this, '待入库')}>
              <div>
                <h1>{this.getAppointmentsCount([waitingAppointments])}</h1>
                <p>待入库</p>
              </div>
            </div>

            <div className={css.grid_item}>
              <div>
                <img src="src/images/notification.png" alt="" />
                <p>VIP管理</p>
              </div>
            </div>

            <div className={css.grid_item} onClick={this.handleClick.bind(this, '历史订单')}>
              <div>
                <h1>{this.getAppointmentsCount([historyAppointments])}</h1>
                <p>历史订单</p>
              </div>
            </div>

            <div className={css.grid_item}>
              <div>
                <img src="src/images/vip.png" alt="" />
                <p>系统通知</p>
              </div>
              {/* <div className={css.red_dot}></div> */}
            </div>

            <div className={css.false_cell}> </div>
            <div className={css.false_cell}> </div>
            <div className={css.false_cell}> </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Desk);
