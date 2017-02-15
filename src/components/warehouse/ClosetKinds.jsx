import React, { Component, PropTypes } from 'react';
import css from './closet_kinds.less'
import { Button } from 'antd';

const { number, string, arrayOf, shape, func } = PropTypes;

export class ClosetKinds extends Component {

	/**
	 * [setKinds 设置衣服种类]
	 */
	setKinds() {
		let img_map = new Map([
			['上衣', 'src/images/shangyi.png'],
			['连衣裙', 'src/images/lianyiqun.png'],
			['裤装', 'src/images/kuzhuang.png'],
			['半裙', 'src/images/banqun.png'],
			['外套', 'src/images/waitao.png'],
			['羽绒服', 'src/images/yurongfu.png'],
			['泳装', 'src/images/yongzhuang.png']
		]);

		let array = [];

		this.props.kinds.forEach((kind, index, obj) => {
			let cs = this.props.active === kind.name ? css.active_item : css.grid_item;
			let icon_path = kind.icon_image ? kind.icon_image : img_map.get(kind.name);

			array.push(
				<div key={index} className={cs}>
					<Button onClick={this.props.handleClick.bind(this, kind)}>
						<img src={icon_path} alt={`${kind.name}`}/>
						<p>{kind.name}</p>
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
	handleClick: () => { console.log("默认的点击事件") }
}

ClosetKinds.PropTypes = {
	kinds: arrayOf(
		shape({
			id: number,
			name: string,
			icon_image: string,
			price: number,
		})
	),
	active: string,
	handleClick: func
}