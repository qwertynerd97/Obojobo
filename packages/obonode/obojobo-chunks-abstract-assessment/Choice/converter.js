import Common from 'obojobo-document-engine/src/scripts/common'
import withoutUndefined from 'obojobo-document-engine/src/scripts/common/util/without-undefined'

 // TODO - remove type when viewer is abstracted out
import { CHOICE_NODE, FEEDBACK_NODE } from '../constants'
import { MC_CHOICE_NODE, MC_FEEDBACK_NODE } from 'obojobo-chunks-multiple-choice-assessment/constants'
import { NUMERIC_FEEDBACK_NODE } from 'obojobo-chunks-numeric-assessment/constants'

/**
 * Generates an Obojobo Choice Node from a Slate node.
 * Copies the id, type, and triggers. It also calls the appropriate
 * slateToObo methods for each of its child components
 * @param {Object} node A Slate Node
 * @returns {Object} An Obojobo Choice node 
 */
const slateToObo = (node, type) => ({
	id: node.id,
	type,
	children: node.children.map(child => {
		const item = Common.Registry.getItemForType(child.type)
		return item.slateToObo(child, type === MC_CHOICE_NODE ? MC_FEEDBACK_NODE : NUMERIC_FEEDBACK_NODE)
	}),
	content: withoutUndefined({
		triggers: node.content.triggers,
		score: node.content. score
	})
})

/**
 * Generates a Slate node from an Obojobo Choice node.
 * Copies all attributes, and calls the appropriate converters for the children
 * @param {Object} node An Obojobo Choice node 
 * @returns {Object} A Slate node
 */
const oboToSlate = node => {
	const slateNode = Object.assign({}, node)
	slateNode.type = CHOICE_NODE
	if(node.children.length > 1) node.children[1].type = FEEDBACK_NODE
	slateNode.children = node.children.map(child => Common.Registry.getItemForType(child.type).oboToSlate(child))
	return slateNode
}

export default { slateToObo, oboToSlate }
