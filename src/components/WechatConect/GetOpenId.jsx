import SuperAgent from 'superagent'
import { withRouter } from 'react-router';
import React, { Component } from 'react';
import auth from './auth'

class GetOpenId extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openid: ''
    };
  }

  componentWillMount() {
    let code = this.getQueryString('code')
    //获取openId
    SuperAgent
      .post("http://wechat-api.tallty.com/cloud_closet_wechat/web_access_token")
      .set('Accept', 'application/json')
      .send({code: code})
      .end( (err, res) => {
        if (res.ok) {
          if (res.body.openid) {
            sessionStorage.setItem('openid', res.body.openid)
            console.log("获取到的openid: "+ res.body.openid)
            this.checkOpenid()
          }else{
            alert('获取用户信息失败，请重新进入！')
          }
        }
      })
  }
  
  /**
   * [checkOpenid 验证openId]
   */
  checkOpenid() {
    SuperAgent
      .post("http://closet-api.tallty.com/user_info/check_openid")
      .set('Accept', 'application/json')
      .send({'user': {'openid': sessionStorage.openid} })
      .end( (err, res) => {
        if (res.ok){
          sessionStorage.state = 'true'
          this.props.router.replace('/')
        }else{
          this.props.router.replace('/login')
        }
      })
  }

  /**
   * [getQueryString 查询url中的name字段的值]
   * @param  {[type]} name [查询的key]
   */
  getQueryString(name) { 
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) { 
      return unescape(r[2]); 
    }
      return null;
  }

  render() {
    return (
      <div></div>
    );
  }
}

export default withRouter(GetOpenId)