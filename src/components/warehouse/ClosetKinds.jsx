import React, { Component, PropTypes } from 'react';
import css from './closet_kinds.less'
import { Button } from 'antd';

const { number, string, arrayOf, shape, func } = PropTypes;

export class ClosetKinds extends Component {

  /**
   * [setKinds 设置衣服种类]
   */
  setKinds() {
    const array = [];

    this.props.kinds.forEach((kind, index, obj) => {
      let cs = this.props.active === kind.title ? css.active_item : css.grid_item;

      array.push(
        <div key={index} className={cs}>
          <Button onClick={this.props.handleClick.bind(this, kind)}>
            <img src={kind.price_icon_image} alt={`${kind.name}`} />
            <p>{kind.title}</p>
          </Button>
          <div className={css.sideBorder}></div>
        </div>
      )
    })
    return array;
  }


  render() {
    return (
      <div className={css.closet_kind}>
        <h3>仓储类型：</h3>
        <div className={css.row}>{this.setKinds()}</div>
      </div>
    );
  }
}

ClosetKinds.defaultProps = {
  kinds: [],
  handleClick: () => { }
}

ClosetKinds.PropTypes = {
  kinds: arrayOf(
    shape({
      id: number,
      title: string,
      price_icon_image: string,
      price: number
    })
  ),
  active: string,
  handleClick: func
}
