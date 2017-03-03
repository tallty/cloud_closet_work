import React, { PropTypes } from 'react';
import css from './count_editer.less';
import { Button, Input } from 'antd';

export default class CountEditer extends React.Component {
  state = {
    count: 1
  }

  componentWillMount() {
    this.setState({ count: this.props.defaultCount });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ count: nextProps.count });
  }

  reduceCount(e) {
    let count = this.state.count;
    if (count > 0) {
      count -= 1
      this.setState({ count: count });
    }
    this.props.onChange(count);
  }

  addCount() {
    let count = this.state.count;
    count += 1;
    this.setState({ count: count });
    this.props.onChange(count);
  }

  handleChange(e) {
    let count = Number(e.target.value);
    count = count < 0 ? 0 : count;
    this.setState({ count: count });
  }

  render() {
    return (
      <div className={css.form_count}>
        <p>数量</p>
        <div className={css.count_input}>
          <Button className={css.count_button} onClick={this.reduceCount.bind(this)}>
            <img src="src/images/reduce_icon.svg" alt="-" />
          </Button>
          <Input
            type="number"
            value={this.state.count}
            max={99}
            onChange={this.handleChange.bind(this)} />
          <Button className={css.count_button} onClick={this.addCount.bind(this)}>
            <img src="src/images/add_icon.svg" alt="+" />
          </Button>
        </div>
      </div>
    );
  }
}

CountEditer.defaultProps = {
  onChange: () => {},
  count: 1
}

CountEditer.propTypes = {
  onChange: PropTypes.func,
  count: PropTypes.number
}
