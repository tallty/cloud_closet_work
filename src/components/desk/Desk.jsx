/**
 * 工作台
 */
import React, { Component } from 'react'
import { Link } from 'react-router'
import css from './desk.less'

export class Desk extends Component {
	componentWillMount() {
    localStorage.setItem('state', '200')
    localStorage.setItem('phone', '18516591232')
    localStorage.setItem('token', 'H55BZoPXHU8W4c1J3zCB')
	}

	render() {
		return (
			<div className={css.container}>
				<div className={css.top}>
					<div className={css.logo}>
						<img src="src/images/logo.svg" alt="logo"/>
					</div>
					<p className={css.name}>乐存好衣</p>
					<p className={css.company}>
						<img src="src/images/logo_icon.svg" alt=""/>
						<span>&nbsp;上海市乐存好衣互联公司</span>
					</p>
					<div className={css.number}>
						<div className={css.new}>
							<p>新增人数</p>
							<p><span>30</span></p>
						</div>
						<div className={css.total}>
							<p>总用户数</p>
							<p><span>8430</span></p>
						</div>
					</div>
				</div>
				<div className={css.bottom}>
					<div className={css.grid_container}>
						<Link to="/appointments">
							<div>
								<h1>6</h1>
								<p>预约入库</p>
							</div>
						</Link>
						<Link to="/">
							<div>
								<h1>12</h1>
								<p>配送管理</p>
							</div>
						</Link>
						<Link to="/">
							<div>
								<h1>2</h1>
								<p>历史订单</p>
							</div>
						</Link>
						<Link to="/">
							<div>
								<img src="src/images/notification.png" alt=""/>
								<p>VIP管理</p>
							</div>
						</Link>
						<Link to="/"><div></div></Link>
						<Link to="/">
							<div>
								<img src="src/images/vip.png" alt=""/>
								<p>系统通知</p>
							</div>
							<div className={css.red_dot}></div>
						</Link>
						<div className={css.false_cell}> </div>
						<div className={css.false_cell}> </div>
						<div className={css.false_cell}> </div>
					</div>
				</div>
			</div>
		)
	}
}
