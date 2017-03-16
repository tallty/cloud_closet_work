import React, { Component } from 'react';
import SuperAgent from 'superagent';
import { withRouter } from 'react-router';
import css from './recharge.less';

class Recharge extends Component {
  state = {
    money: '',
    tips: '',
    error: '',
    rules: []
  }


  componentWillMount() {
    SuperAgent
      .get('http://closet-api.tallty.com/recharge_rules')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (!err || err === null) {
          console.log(res.body.recharge_rules)
          this.setState({ rules: res.body.recharge_rules });
        }
      })
  }

  handleMoneyChange(e) {
    const v = Number(e.target.value) === 0 ? '' : Number(e.target.value);
    this.setState({ money: v });
  }

  handleTipsChange(e) {
    if (e.target.value.length > 20) return;
    this.setState({ tips: e.target.value });
  }

  handleClick() {
    const { money, tips, rules } = this.state;
    if (!money) {
      this.setState({ error: '请输入充值金额' });
      return;
    }
    const rule = rules.filter(item => (money >= item.amount)).pop();
    const userId = this.props.location.query.user_id;
    SuperAgent
      .post('http://closet-api.tallty.com/worker/offline_recharges')
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .send({
        offline_recharge: {
          user_id: userId,
          amount: money,
          credit: rule && rule.credits || 0
        }
      })
      .end((err, res) => {
        if (!err || err === null) {
          this.props.router.replace('/success?status=充值成功&action=recharge');
        } else {
          alert('充值失败');
        }
      })
  }

  render() {
    const { money, tips, error } = this.state;
    return (
      <div className={css.container}>
        <div className={css.imgIcons}>
          <div className={css.iconContainer}>
            <img src="src/images/icon_pay.svg" alt="icon" className={css.icon} />
            <img src="src/images/icon_pay.svg" alt="icon" className={css.photo} />
          </div>
        </div>
        <p className={css.title}>账户充值</p>
        <div className={css.formContainer}>
          <div className={css.label}>充值金额</div>
          <div className={css.inputDiv}>
            <span>¥</span>
            <input type="number" value={money} onChange={this.handleMoneyChange.bind(this)} />
          </div>
          {error ? <p className={css.error}>{error}</p> : null}
          <input className={css.tips} value={tips} type="text" placeholder="添加备注（不超过20字）" onChange={this.handleTipsChange.bind(this)} />
        </div>
        <button className={css.confirmBtn} onClick={this.handleClick.bind(this)}>确认充值</button>
      </div>
    );
  }
}

export default withRouter(Recharge);
