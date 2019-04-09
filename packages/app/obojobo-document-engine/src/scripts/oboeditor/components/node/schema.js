import { Block } from 'slate'

import SchemaViolations from '../../util/schema-violations'

const { CHILD_MAX_INVALID, CHILD_MIN_INVALID, CHILD_UNKNOWN, CHILD_TYPE_INVALID } = SchemaViolations

const TEXT_NODE = 'ObojoboDraft.Chunks.Text'
const PAGE_NODE = 'ObojoboDraft.Pages.Page'

const schema = {
	blocks: {
		'oboeditor.component': {
			nodes: [
				{
					match: [
						{ type: 'ObojoboDraft.Chunks.ActionButton' },
						{ type: 'ObojoboDraft.Chunks.Break' },
						{ type: 'ObojoboDraft.Chunks.Code' },
						{ type: 'ObojoboDraft.Chunks.Figure' },
						{ type: 'ObojoboDraft.Chunks.Heading' },
						{ type: 'ObojoboDraft.Chunks.HTML' },
						{ type: 'ObojoboDraft.Chunks.IFrame' },
						{ type: 'ObojoboDraft.Chunks.List' },
						{ type: 'ObojoboDraft.Chunks.MathEquation' },
						{ type: 'ObojoboDraft.Chunks.Table' },
						{ type: 'ObojoboDraft.Chunks.Text' },
						{ type: 'ObojoboDraft.Chunks.YouTube' },
						{ type: 'ObojoboDraft.Chunks.QuestionBank' },
						{ type: 'ObojoboDraft.Chunks.Question' }
					],
					min: 1,
					max: 1
				}
			],
			normalize: (editor, error) => {
				console.log('oboeditor', error)
				const { node, child, index } = error
				switch (error.code) {
					case CHILD_UNKNOWN: {
						return editor.unwrapNodeByKey(child.key)
					}
					case CHILD_TYPE_INVALID: {
						if(child.object === 'text') {
							return editor.removeNodeByKey(node.key)
						}

						if(child.type === 'oboeditor.component') {
							return editor.unwrapNodeByKey(child.key)
						}

						return editor.withoutNormalizing(e => {
							return child.nodes.forEach(grandchild => e.unwrapNodeByKey(grandchild.key))
						})
					}
					case CHILD_MIN_INVALID: {
						const block = Block.create({
							type: TEXT_NODE
						})
						return editor.insertNodeByKey(node.key, index, block)
					}
					// Change to a constant when slate-schema-violations updates
					case CHILD_MAX_INVALID: {
						console.log(node.toJSON())
						return editor.splitNodeByKey(node.key, 1)
					}
				}
			}
		}
	}
}

export default schema
