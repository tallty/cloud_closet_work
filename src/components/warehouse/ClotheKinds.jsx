import React, { Component, PropTypes } from 'react';
import css from './clothe_kinds.less'
import { Row, Col, Button } from 'antd';

const { number, string, arrayOf, shape, func } = PropTypes;

export class ClotheKinds extends Component {

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
			// let active = this.state._kind === kind[1] ? css.active : null
			let active = null;
			let icon_path = kind.icon_image ? kind.icon_image : img_map.get(kind.name);

			array.push(
				<Col span={6} key={index}>
					<Button onClick={this.props.handleClick.bind(this, kind)} className={active}>
						<img src={icon_path} alt={`${kind.name}`}/>
						<p>{kind.name}</p>
					</Button>
	      </Col>
			)
		})
		return array;
	}


	render() {
		return (
			<div className={css.clothe_kind}>
				<Row>{this.setKinds()}</Row>
			</div>
		);
	}
}

ClotheKinds.defaultProps = {
	kinds: [],
	handleClick: () => { console.log("默认的点击事件") }
}

ClotheKinds.PropTypes = {
	kinds: arrayOf(
		shape({
			id: number,
			name: string,
			icon_image: string,
			price: number,
		})
	),
	handleClick: func
}