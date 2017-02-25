import React, { PropTypes } from 'react';
import css from './state_user_info.less';
import StateBadge from './StateBadge';

const { string, shape, number } = PropTypes;

export default class StateUserInfo extends React.Component {
  state = {
  	photo: '',
  }

  componentWillMount() {
    this.setState({ photo: this.props.user.photo });
  }

  handlePhotoLoadError() {
    this.setState({ photo: '/src/images/default_photo.svg' });
  }

  render() {
    const { nextState, nowState, user } = this.props;
    const { photo } = this.state;
    return (
      <div>
        <div className={css.content}>
          <StateBadge now={nowState} next={nextState} />
          <a href={`tel:${user.phone}`} className={css.user_info}>
            <img 
              src={ photo || 'error' } 
              alt="photo" 
              className={css.photo}
              onError={ this.handlePhotoLoadError.bind(this) } />
            <div className={css.name_phone}>
              <p className={css.name}>{ user.name }</p>
              <p className={css.phone}>
                <img src="/src/images/phone_icon.svg" alt="call"/>{ user.phone }
              </p>
            </div>
          </a>
        </div>

        <div className={css.address}>
          <img src="src/images/address_icon.svg" alt=""/>
          <span>{ user.address }</span>
        </div>
      </div>
    );
  }
}

StateUserInfo.propTypes = {
  nowState: string,
  nextState: string,
  user: shape({
    name: string,
    phone: string,
    photo: string,
    address: string,
    date: string,
    number: number,
  }),
};

StateUserInfo.defaultProps = {
  nowState: '',
  nextState: '',
  user: shape({
    name: '',
    phone: '',
    photo: '/src/images/default_photo.svg',
    address: '',
    date: '',
    number: 0,
  }),
}