import SuperAgent from 'superagent';

module.exports = {

  getSkipUrl(){
    let appid = 'wx47b02e6b45bf1dad'
    let secret = 'b78a5266c57391d8bd7bce75e86fc3c0'
    let OAuth = require('wechat-oauth');
    let client = new OAuth(appid, secret);
    let urlt = 'http://closet-work.tallty.com/'+'get_open_id'
    let url = client.getAuthorizeURL(urlt, '123', 'snsapi_base');
    window.location.href = url;
  },

  /**
   * [loggedIn 对用户进行鉴权]
   */
  loggedIn() {
    SuperAgent
      .post("http://closet-api.tallty.com/user_info/check_openid")
      .set('Accept', 'application/json')
      .send({'user': {'openid': localStorage.openid} })
      .end( (err, res) => {
        localStorage.setItem('state', res.ok)
        console.log("鉴权state: "+localStorage.state)
        if (res.ok) {
          localStorage.setItem('phone',res.body.phone)
          localStorage.setItem('authentication_token',res.body.authentication_token)
          console.log("鉴权phone: "+localStorage.phone)
          console.log("鉴权authentication_token: "+localStorage.authentication_token)
          console.log("鉴权成功")
        } else {
          console.log("鉴权失败")
          // 重新获取openid
          this.getSkipUrl();
        }
      })
  }
}