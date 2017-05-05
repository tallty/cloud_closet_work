// 品牌主页
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import LogInForm from './LogInForm'
import classnames from 'classnames'
import styles from './LogIn.less'

export class LogIn extends Component {

  render() {
    return (
      <div className={styles.LogIn_content}>
        <div className={styles.login_header_content}>
          <div className={styles.login_header}>
            <img src="/src/images/logo.svg" className={styles.login_header_pic} alt="logo" />
            <p className={styles.login_header_slogan}>您的网上云衣橱</p>
          </div>
        </div>
        <LogInForm />
      </div>
    );
  }
}

LogIn.defaultProps = {
}

LogIn.propTypes = {
};
