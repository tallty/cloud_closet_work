/**
 * 预约入库
 * 进入时：读取 sessionStorage.appointment
 * 点击入库时：更新 sessionStorage.appointment
 */
import React, { Component, PropTypes } from 'react';
import css from './ware_house.less';
import { withRouter } from 'react-router';
import { UserInfo } from '../user_info/UserInfo';
import { ClothesTable } from '../clothes_table/ClothesTable';
import { ClosetKinds } from './ClosetKinds';
import { Spiner } from '../common/Spiner';
import { Toolbar } from '../common/Toolbar';
import { Row, Col, Button, Radio, Select, Input, InputNumber } from 'antd';
import { PopWindow } from '../common/PopWindow';
import SuperAgent from 'superagent';
import CountEditer from './CountEditer';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
// 记录点击表格条目的对象
const editItem = {
  index: null,
  item: null
};
// 入库列表操作事件类别：
const NEW = 'new';
const EDIT = 'edit';

class WareHouse extends Component {
  appointment_id = this.props.location.query.appointment_id;
  state = {
    appointment: null,      // 【Data】服务的订单对象
    types: [],              // 【Data】所有衣服类型
    loading: false,         // 【Logic】载入状态
    pop: false,              // 【Logic】弹框控制
    event: null,            // 【Logic】事件：【新增 | 编辑】
    stacking: 0,
    hanging: 0,
    fullDress: 0,
    object: {}
  }

  componentWillMount() {
    // 取得缓存本地的 appointment 清单
    const localAppointment = sessionStorage.appointment;
    const data = JSON.parse(localAppointment);
    const countInfo = data.garment_count_info || {};
    this.setState({
      appointment: {
        ...data,
        care_cost: data.care_cost || 0,
        service_cost: data.service_cost || 0,
        care_type: data.care_type || '普通护理'
      },
      stacking: countInfo.stacking || 0,
      hanging: countInfo.hanging || 0,
      fullDress: countInfo.full_dress || 0
    });
    this.getTypes();
  }

  /**
   * [getTypes 获取衣服种类的列表]
   */
  getTypes() {
    SuperAgent
      .get('http://closet-api.tallty.com/worker/price_systems')
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .end((err, res) => {
        if (!err || err === null) {
          const data = res.body.price_systems;
          this.setState({ types: data });
        } else {
          this.setState({ types: [] });
        }
      })
  }

  /**
   * [selectClotheType 显示弹出窗]
   * @param  {[object]} type [选择的衣服种类、价格]
   */
  selectClotheType(type) {
    const month = type.is_chest ? 3 : 1;
    // 创建一个临时对象
    const obj = {
      price_system_id: type.id,
      title: type.title,
      count: 1,
      price: 0,
      unit_price: type.price,
      store_month: month,
      is_chest: type.is_chest
    }
    this.setState({ pop: true, event: NEW, object: obj });
  }

  /**
   * [hidePopWindow 弹出窗关闭执行的事件]
   */
  hidePopWindow() {
    this.setState({ pop: false })
  }

  /**
   * [handleCountChange] 处理数量改变
   */
  handleCountChange(count) {
    const obj = this.state.object;
    obj.count = count;
    this.setState({ object: obj });
  }

  /**
   * [onLengthChange 改变仓储时长]
   * @param  {[node]} e [选择的radio按钮]
   */
  onLengthChange(e) {
    const obj = this.state.object;
    obj.store_month = parseInt(e.target.value, 10);
    this.setState({ object: obj });
  }

  // 添加衣服到列表
  addClotheEvent() {
    const { object, appointment } = this.state;
    object.price = object.count * object.store_month * object.unit_price;
    appointment.price += object.price;
    // 增加一条入库记录
    appointment.appointment_price_groups.push(object);

    // 更新订单合计
    this.setState({ appointment: appointment, pop: false });
  }

  // 更新列表中的衣服信息
  updateClotheEvent() {
    const { object, appointment } = this.state;
    const groups = appointment.appointment_price_groups;
    // 更新的条目
    let item = groups[editItem.index];
    if (object.count === 0) {
      groups.splice(editItem.index, 1)
    } else {
      object.price = object.count * object.store_month * object.unit_price;
      item = object;
    }
    appointment.price = this.getTotalPrice(appointment);
    this.setState({ appointment: appointment, pop: false });
  }

  /**
   * [getTotalPrice 计算本次入库的总价格]
   */
  getTotalPrice(appointment) {
    // 入库衣服总价格(无运费、服务费)
    let total = 0;
    appointment.appointment_price_groups.forEach((item, i, obj) => {
      total += item.price;
    });
    return total;
  }

  /**
   * [handleGroupClick 【衣柜记录】列表的点击事件]
   * @param  {[type]} index [点击的条目在appointment.appointment_price_groups中的索引]
   * @param  {[type]} item  [点击的条目对象]
   */
  handleGroupClick(index, item) {
    editItem.item = item;
    editItem.index = index;
    this.setState({
      object: item,
      pop: true,
      event: EDIT
    });
  }

  /**
   * [handleWarehouse 入库生成订单逻辑]
   * @return {[type]} [description]
   */
  handleWarehouse() {
    this.setState({ loading: true });
    // 缓存数据
    const { appointment, stacking, hanging, fullDress } = this.state;
    // appointment.price = this.getAppointmentTotal();
    //存入storage
    sessionStorage.setItem('appointment', JSON.stringify(appointment));
    // 开始提交，封装更新的数据包
    let cache = `appointment[care_type]=${appointment.care_type}`;
    cache += `&appointment[care_cost]=${appointment.care_cost}`;
    cache += `&appointment[service_cost]=${appointment.service_cost}`;
    cache += `&appointment[garment_count_info][hanging]=${hanging}`;
    cache += `&appointment[garment_count_info][stacking]=${stacking}`;
    cache += `&appointment[garment_count_info][full_dress]=${fullDress}`;
    appointment.appointment_price_groups.forEach((item, index, obj) => {
      cache += `&appointment_items[price_groups][][count]=${item.count}`;
      cache += `&appointment_items[price_groups][][price_system_id]=${item.price_system_id}`;
      cache += `&appointment_items[price_groups][][store_month]=${item.store_month}&`;
    });
    const params = cache.substring(0, cache.length - 1);
    if (!this.validateForm()) {
      this.setState({ loading: false });
      return;
    }
    SuperAgent
      .put(`http://closet-api.tallty.com/worker/appointments/${appointment.id}`)
      .set('Accept', 'application/json')
      .set('X-Worker-Token', localStorage.authentication_token)
      .set('X-Worker-Phone', localStorage.phone)
      .send(params)
      .end((err, res) => {
        this.setState({ loading: false });
        if (res.status === 422) {
          alert(res.body.error);
        } else if (res.status < 300 && res.status >= 200) {
          this.props.router.replace(`success?appointment_id=${this.appointment_id}`);
        } else {
          alert('提交订单失败，工程师正在紧急修复')
        }
      })
  }

  // 验证表单
  validateForm() {
    const { hanging, fullDress, stacking, appointment } = this.state;
    let res = null;
    if (hanging === 0 && fullDress === 0 && stacking === 0) {
      alert('请记录入库衣服数量');
      res = false;
    } else if (!appointment.care_type) {
      alert('请选择护理类型');
      res = false;
    } else {
      res = true;
    }
    return res;
  }

  /**
   * [handleCareTypeChange 选择护理方式]
   * @param  {[string]} value [选择的护理方式]
   */
  handleCareTypeChange(value) {
    const obj = this.state.appointment;
    obj.care_type = value;
    this.setState({ appointment: obj });
  }

  /**
   * [handleCareTypeChargeInputChange 护理费 | 服务费用 输入处理]
   */
  handleCareAndServiceChange(kind, e) {
    this.setState({ appointment: { ...this.state.appointment, [kind]: Number(e.target.value) } });
  }

  /**
   * 处理不同种类衣服的数量
   */
  handleKindClothesCount(kind, value) {
    this.setState({ [kind]: value });
  }

  getAppointmentTotal() {
    const { care_cost, service_cost, price } = this.state.appointment;
    return price + care_cost + service_cost;
  }

  render() {
    // 状态
    const { appointment, types, pop, loading, event, object } = this.state;
    return (
      <div className={css.container}>
        <Toolbar title="预约入库" url={`/appointment?id=${this.appointment_id}`} />
        <UserInfo
          name={appointment.name}
          photo={appointment.user_avatar}
          phone={appointment.phone}
        />
        {/* 仓储类型 */}
        <ClosetKinds kinds={types} active={object.title} handleClick={this.selectClotheType.bind(this)} />
        {/* 衣柜记录 */}
        <div className={css.pane}>
          <div className={css.pane_header}>衣柜记录</div>
          <div className={css.pane_body}>
            <ClothesTable groups={appointment.appointment_price_groups} itemClickEvent={this.handleGroupClick.bind(this)} />
            {/* 种类件数 */}
            <p className={css.title}>种类件数</p>
            <Row>
              <Col xs={{ span: 12 }} sm={{ span: 6 }}>
                <div className={css.pane_input}>
                  <img src="/src/images/icon_fold.svg" alt="fold" />
                  <span>叠放：</span>
                  <InputNumber
                    type="number"
                    min={0}
                    style={{ width: 60, borderColor: '#ECC17D' }}
                    value={this.state.stacking}
                    onChange={this.handleKindClothesCount.bind(this, 'stacking')}
                  />
                  <span> 件 </span>
                </div>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 6 }} >
                <div className={css.pane_input}>
                  <img src="/src/images/icon_hang.svg" alt="fold" />
                  <span>挂放：</span>
                  <InputNumber
                    type="number"
                    min={0}
                    style={{ width: 60, borderColor: '#ECC17D' }}
                    value={this.state.hanging}
                    onChange={this.handleKindClothesCount.bind(this, 'hanging')}
                  />
                  <span> 件 </span>
                </div>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 6 }}>
                <div className={css.pane_input}>
                  <img src="/src/images/icon_dress.svg" alt="fold" />
                  <span>礼服：</span>
                  <InputNumber
                    type="number"
                    min={0}
                    style={{ width: 60, borderColor: '#ECC17D' }}
                    value={this.state.fullDress}
                    onChange={this.handleKindClothesCount.bind(this, 'fullDress')}
                  />
                  <span> 件 </span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        {/* price */}
        <div className={css.tips_container}>
          <Row>
            <Col sm={{ span: 12 }}>
              <div className={css.tips}>
                <span>护理费用：</span>
                <Input
                  type="number"
                  style={{ width: 75, borderColor: '#ECC17D' }}
                  onChange={this.handleCareAndServiceChange.bind(this, 'care_cost')}
                  value={appointment.care_cost}
                />
                <span> 元 &nbsp;&nbsp;</span>
                <Select
                  defaultValue={appointment.care_type}
                  style={{ width: 90, marginBootom: 1 }}
                  onChange={this.handleCareTypeChange.bind(this)}
                >
                  <Option value="普通护理">普通护理</Option>
                  <Option value="高级护理">精洗护理</Option>
                </Select>
              </div>
            </Col>

            <Col sm={{ span: 12 }}>
              <div className={css.tips}>
                <span>服务费用：</span>
                <Input
                  type="number"
                  style={{ width: 75, borderColor: '#ECC17D' }}
                  onChange={this.handleCareAndServiceChange.bind(this, 'service_cost')}
                  value={appointment.service_cost}
                />
                <span> 元</span>
              </div>
            </Col>
          </Row>
          <p className={css.total_price}>合计：<span>{appointment.price + appointment.care_cost + appointment.service_cost}</span></p>
        </div>
        {/* 入库 */}
        <div className={css.btn_container}>
          <Button
            className={css.tab_btn}
            loading={loading}
            onClick={this.handleWarehouse.bind(this)}
          >入库</Button>
        </div>
        {/* popwindow */}
        <PopWindow show={pop} direction="bottom" onCancel={this.hidePopWindow.bind(this)}>
          <div className={css.pop_content}>
            <div className={css.title}>{object.title}</div>
            {/* 仓储时长 */}
            {
              object.is_chest ?
                <div className={css.warehouse_length}>
                  <p>仓储时长</p>
                  <div className={css.radio_container}>
                    <RadioGroup
                      onChange={this.onLengthChange.bind(this)}
                      value={`${object.store_month}`}
                      defaultValue="3"
                    >
                      <RadioButton value="3">三个月</RadioButton>
                      <RadioButton value="6">六个月</RadioButton>
                      <RadioButton value="9">九个月</RadioButton>
                      <div style={{ height: 10 }}></div>
                      <RadioButton value="12">一年</RadioButton>
                      <RadioButton value="24">两年</RadioButton>
                    </RadioGroup>
                  </div>
                </div> : null
            }
            {/* 衣柜数量 */}
            <CountEditer count={object.count} onChange={this.handleCountChange.bind(this)} />
            {/* 操作 */}
            <div className={css.actions}>
              <div className={css.btn}>
                <button onClick={this.hidePopWindow.bind(this)}>取消</button>
              </div>
              <div className={css.btn}>
                {
                  event === NEW ?
                    <button onClick={this.addClotheEvent.bind(this)}>确定</button> :
                    <button onClick={this.updateClotheEvent.bind(this)}>更新</button>
                }
              </div>
            </div>
          </div>
        </PopWindow>
      </div>
    );
  }
}

WareHouse.defaultProps = {

}

WareHouse.propTypes = {

}

export default withRouter(WareHouse);
