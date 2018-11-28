import React from 'react'
import { Block } from 'slate'
import { CHILD_REQUIRED, CHILD_TYPE_INVALID } from 'slate-schema-violations'

const BREAK_NODE = 'ObojoboDraft.Chunks.Break'
const CODE_NODE = 'ObojoboDraft.Chunks.Code'
const FIGURE_NODE = 'ObojoboDraft.Chunks.Figure'
const HEADING_NODE = 'ObojoboDraft.Chunks.Heading'
const HTML_NODE = 'ObojoboDraft.Chunks.HTML'
const IFRAME_NODE = 'ObojoboDraft.Chunks.IFrame'
const LIST_NODE = 'ObojoboDraft.Chunks.List'
const MATH_NODE = 'ObojoboDraft.Chunks.MathEquation'
const MCANSWER_NODE = 'ObojoboDraft.Chunks.MCAssessment.MCAnswer'
const TABLE_NODE = 'ObojoboDraft.Chunks.Table'
const TEXT_NODE = 'ObojoboDraft.Chunks.Text'
const YOUTUBE_NODE = 'ObojoboDraft.Chunks.YouTube'

import Break from '../../Break/editor'
import Code from '../../Code/editor'
import Figure from '../../Figure/editor'
import Heading from '../../Heading/editor'
import HTML from '../../HTML/editor'
import IFrame from '../../IFrame/editor'
import List from '../../List/editor'
import MathEquation from '../../MathEquation/editor'
import Table from '../../Table/editor'
import Text from '../../Text/editor'
import YouTube from '../../YouTube/editor'
import DefaultNode from '../../../../src/scripts/oboeditor/components/default-node'

const nodes = {
	'ObojoboDraft.Chunks.Break': Break,
	'ObojoboDraft.Chunks.Code': Code,
	'ObojoboDraft.Chunks.Figure': Figure,
	'ObojoboDraft.Chunks.Heading': Heading,
	'ObojoboDraft.Chunks.HTML': HTML,
	'ObojoboDraft.Chunks.IFrame': IFrame,
	'ObojoboDraft.Chunks.List': List,
	'ObojoboDraft.Chunks.MathEquation': MathEquation,
	'ObojoboDraft.Chunks.Table': Table,
	'ObojoboDraft.Chunks.Text': Text,
	'ObojoboDraft.Chunks.YouTube': YouTube
}

const Node = props => {
	return (
		<div className={'component obojobo-draft--chunks--mc-assessment--mc-answer'}>
			{props.children}
		</div>
	)
}

const slateToObo = node => {
	const json = {}
	json.id = node.key
	json.type = node.type
	json.content = node.data.get('content') || {}
	json.children = []

	node.nodes.forEach(child => {
		// If the current Node is a registered OboNode, use its custom converter
		if (nodes.hasOwnProperty(child.type)) {
			json.children.push(nodes[child.type].helpers.slateToObo(child))
		} else {
			json.children.push(DefaultNode.helpers.slateToObo(child))
		}
	})

	return json
}

const oboToSlate = node => {
	const json = {}
	json.object = 'block'
	json.key = node.id
	json.type = node.type
	json.data = { content: node.content }
	json.nodes = []

	node.children.forEach(child => {
		// If the current Node is a registered OboNode, use its custom converter
		if (nodes.hasOwnProperty(child.type)) {
			json.nodes.push(nodes[child.type].helpers.oboToSlate(child))
		} else {
			json.nodes.push(DefaultNode.helpers.oboToSlate(child))
		}
	})

	return json
}

const plugins = {
	renderNode(props) {
		switch (props.node.type) {
			case MCANSWER_NODE:
				return <Node {...props} {...props.attributes} />
		}
	},
	schema: {
		blocks: {
			'ObojoboDraft.Chunks.MCAssessment.MCAnswer': {
				nodes: [
					{
						match: [
							{ type: BREAK_NODE },
							{ type: CODE_NODE },
							{ type: FIGURE_NODE },
							{ type: HEADING_NODE },
							{ type: HTML_NODE },
							{ type: IFRAME_NODE },
							{ type: LIST_NODE },
							{ type: MATH_NODE },
							{ type: TEXT_NODE },
							{ type: TABLE_NODE },
							{ type: YOUTUBE_NODE },
							{ type: HTML_NODE }
						],
						min: 1
					}
				],
				normalize: (change, error) => {
					const { node, child, index } = error
					switch (error.code) {
						case CHILD_REQUIRED: {
							const block = Block.create({
								type: TEXT_NODE,
								data: { content: { indent: 0 } }
							})
							return change.insertNodeByKey(node.key, index, block)
						}
						case CHILD_TYPE_INVALID: {
							if (child.object !== 'text') return
							return change.wrapBlockByKey(child.key, {
								type: TEXT_NODE,
								data: { content: { indent: 0 } }
							})
						}
					}
				}
			}
		}
	}
}

const MCAnswer = {
	components: {
		Node
	},
	helpers: {
		slateToObo,
		oboToSlate
	},
	plugins
}

export default MCAnswer
