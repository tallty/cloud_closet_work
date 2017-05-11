import React, { Component } from 'react';
import SuperAgent from 'superagent';
import { withRouter } from 'react-router';
import css from './recharge.less';
import { Button, message } from 'antd';

let timer = null;

class Recharge extends Component {
  state = {
    money: '',
    tips: '',
    error: '',
    codeError: '',
    rules: [],
    code: '',
    codeBtnText: '获取验证码',
    codeBtnDisabled: false,
    loading: false,
    codeLoading: false
  }


  componentWillMount() {
    SuperAgent
      .get('http://closet-api.tallty.com/recharge_rules')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (!err || err === null) {
          this.setState({ rules: res.body.recharge_rules });
        }
      })
  }

  getCode() {
    const { money } = this.state;
    if (!money) {
      this.setState({ error: '请输入充值金额' });
      return;
    }
    this.setState({ codeLoading: true, error: '', codeError: '' });
    SuperAgent
      .post('http://closet-api.tallty.com/worker/offline_recharges/get_auth_code')
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .send({ offline_recharge: { amount: money } })
      .end((err, res) => {
        if (!err || err === null) {
          this.setState({ codeLoading: false });
          this.handleTimer();
        } else {
          this.setState({ codeLoading: false });
          message.error('获取验证码失败，请联系客服');
        }
      })
  }

  handleTimer() {
    let count = 60;
    this.setState({ codeBtnDisabled: true });
    timer = setInterval(() => {
      this.setState({ codeBtnText: `${count}秒` });
      if (count <= 0) {
        clearTimeout(timer);
        this.setState({ codeBtnText: '重新获取', codeBtnDisabled: false });
      } else {
        count--;
      }
    }, 1000);
  }

  handleMoneyChange(e) {
    const v = Number(e.target.value) === 0 ? '' : Number(e.target.value);
    this.setState({ money: v });
  }

  handleCodeChange(e) {
    this.setState({ code: e.target.value });
  }

  handleTipsChange(e) {
    if (e.target.value.length > 20) return;
    this.setState({ tips: e.target.value });
  }

  handleClick() {
    const { money, tips, rules, code } = this.state;
    if (!money) {
      this.setState({ error: '请输入充值金额' });
      return;
    }
    if (!code) {
      this.setState({ codeError: '请输入验证码' });
      return;
    }
    this.setState({ loading: true, error: '', codeError: '' });
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
          credit: rule && rule.credits || 0,
          auth_code: code
        }
      })
      .end((err, res) => {
        if (!err || err === null) {
          this.props.router.replace('/success?status=充值成功&action=recharge');
        } else {
          this.setState({ loading: false });
          message.error(res.body.error);
        }
      })
  }

  render() {
    const { money, tips, error, code, codeError, codeBtnText, codeBtnDisabled, loading, codeLoading } = this.state;
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
          <div className={css.code}>
            <input type="tel" value={code} onChange={this.handleCodeChange.bind(this)} className={css.codeInput} placeholder="请输入验证码" />
            <Button
              className={css.getCodeBtn}
              disabled={codeBtnDisabled}
              loading={codeLoading}
              onClick={this.getCode.bind(this)}
            >{codeBtnText}</Button>
          </div>
          {codeError ? <p className={css.error}>{codeError}</p> : null}
          <input className={css.tips} value={tips} type="text" placeholder="添加备注（不超过20字）" onChange={this.handleTipsChange.bind(this)} />
        </div>
        <Button className={css.confirmBtn} loading={loading} onClick={this.handleClick.bind(this)}>确认充值</Button>
      </div>
    );
  }
}

export default withRouter(Recharge);
