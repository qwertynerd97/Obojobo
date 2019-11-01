import './editor-component.scss'

import React from 'react'
import { Block } from 'slate'

import emptyRubric from './components/rubric/empty-node.json'

class Assessment extends React.Component {
	constructor(props) {
		super(props)
		this.state = this.props.node.data.get('content')
		this.addRubric = this.addRubric.bind(this)
	}

	addRubric() {
		const newRubric = Block.create(emptyRubric)
		return this.props.editor.insertNodeByKey(
			this.props.node.key,
			this.props.node.nodes.size,
			newRubric
		)
	}

	render() {
		return (
			<div className={'obojobo-draft--sections--assessment'}>
				{this.props.children}
			</div>
		)
	}
}

export default Assessment
