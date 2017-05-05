/**
 * 预约清单
 */
import React, { Component } from 'react'
import css from './appoint.less'
import { Toolbar } from '../common/Toolbar'
import { DateAppointments } from './DateAppointments'
import SuperAgent from 'superagent'

export class Appointments extends Component {
  state = {
    appointments: [],
    title: '预约清单'
  }

  componentWillMount() {
    const apm = JSON.parse(sessionStorage.appointments)
    const toolbarTitle = JSON.parse(sessionStorage.getItem('appointmentsTitle'));
    this.setState({
      appointments: apm,
      title: toolbarTitle
    })
  }

  render() {
    return (
      <div className={css.appointments} id="appointments">
        <Toolbar title={this.state.title} url="/" />
        {
          this.state.appointments.map((item, i) =>
            (<DateAppointments date={item.date} items={item.items} key={i} />))
        }
      </div>
    )
  }
}
