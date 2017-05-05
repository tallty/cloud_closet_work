// 登陆页
import SuperAgent from 'superagent'
import React, { Component, PropTypes } from 'react'
import { Row, Col, Input, Button, message } from 'antd'
import { Link, withRouter } from 'react-router'
import classnames from 'classnames'
import styles from './LogInForm.less'

const InputGroup = Input.Group;

class LogInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      password: ''
    }
  }

  handlePhone(e) {
    this.setState({
      phone: e.target.value
    });
  }

  handlePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  /**
   * [signIn 登录]
   */
  signIn() {
    const mPhone = this.state.phone;
    const mPassword = this.state.password;
    SuperAgent
      .post('http://closet-api.tallty.com/users/sign_in')
      .set('Accept', 'application/json')
      .send({
        user: {
          phone: mPhone,
          password: mPassword
        }
      })
      .end((err, res) => {
        if (res.ok) {
          localStorage.setItem('phone', res.body.phone);
          localStorage.setItem('authentication_token', res.body.authentication_token);
          localStorage.setItem('lastTime', JSON.stringify((new Date).getTime()));
          this.props.router.replace('/');
        } else {
          message.error('登录失败，请检查账户信息！');
        }
      })
  }


  render() {
    const containerClassnames1 = classnames(
      styles.login_input_header_label1,
      styles.login_input_header_label,
    )
    const containerClassnames2 = classnames(
      styles.login_input_header_label2,
      styles.login_input_header_label,
    )
    return (
      <div className={styles.login_body_content}>
        <InputGroup>
          <Row className={styles.login_input_header}>
            <Col span={6} className={containerClassnames1}>
              <img className={styles.login_input_icon1} src="src/images/flag.svg" alt="" /><br />+86
            </Col>
            <Col span={18} className={styles.login_input_header_label1}>
              <Input placeholder="手机号码" type="number" pattern="\d*" value={this.state.phone} onChange={this.handlePhone.bind(this)} />
            </Col>
          </Row>
        </InputGroup>
        <InputGroup>
          <Row className={styles.login_input_header}>
            <Col span={6} className={containerClassnames2}>密码</Col>
            <Col span={18} className={styles.login_input_header_label4}>
              <Input
                placeholder="请输入密码"
                type="password"
                id="password"
                value={this.state.password}
                onChange={this.handlePassword.bind(this)}
              />
            </Col>
          </Row>
        </InputGroup>
        <Row className={styles.login_btn_content}>
          <Col span={24}>
            <Button
              className={styles.login_btn}
              type="primary"
              htmlType="submit"
              onClick={this.signIn.bind(this)}
            >登录</Button>
          </Col>
        </Row>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(LogInForm)
