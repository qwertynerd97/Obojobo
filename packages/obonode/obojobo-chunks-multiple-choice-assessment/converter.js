import Common from 'obojobo-document-engine/src/scripts/common'
import OboModel from 'obojobo-document-engine/src/scripts/common/models/obo-model'
import withoutUndefined from 'obojobo-document-engine/src/scripts/common/util/without-undefined'

import { MC_CHOICE_NODE } from './constants'
import { CHOICE_NODE } from 'obojobo-chunks-abstract-assessment/constants'

// TODO - refactor converter when viewer is abstracted

/**
 * Generates an Obojobo MCAssessment Node from a Slate node.
 * Copies the id, type, triggers, shuffle, and sets the responseType
 * based on the number of correct children. It also calls the appropriate
 * slateToObo methods for each of its child components
 * @param {Object} node A Slate Node
 * @returns {Object} An Obojobo MCAssessment node 
 */
const slateToObo = node => {
	let responseType = node.content.responseType
	let correct = 0

	const children = node.children.map(child => {
		if (child.content.score === 100) correct++

		return Common.Registry.getItemForType(child.type).slateToObo(child, MC_CHOICE_NODE)
	})

	if (correct > 1 && responseType === 'pick-one') {
		responseType = 'pick-one-multiple-correct'
	}
	if (correct === 1 && responseType === 'pick-one-multiple-correct') {
		responseType = 'pick-one'
	}

	const json = {
		id: node.id,
		type: node.type,
		children,
		content: withoutUndefined({
			triggers: node.content.triggers,
			responseType,
			shuffle: node.content.shuffle
		})
	}

	console.log('json', json)
	return json
}

/**
 * Generates a Slate node from an Obojobo MCAssessment node.
 * Copies all attributes, and calls the appropriate converters for the children
 * It also retrieves and stores the type of the parent question, to allow for proper
 * rendering of the elements.
 * @param {Object} node An Obojobo MCAssessment node 
 * @returns {Object} A Slate node
 */
const oboToSlate = node => {
	const slateNode = Object.assign({}, node)

	// Need to get the question type from the Question parent
	// This is done to render elements correctly
	const oboModel = OboModel.models[node.id]
	const questionModel = oboModel.parent
	const questionType = questionModel.attributes.content.type

	console.log(node.children)
	if(!node.children)  { 
		node.children = [
			{
				"id": "52c5d907-a37b-4491-9702-5a7a184df68a",
				"type": "ObojoboDraft.Chunks.MCAssessment.MCChoice",
				"content": {
					"score": 0
				},
				"children": [
					{
						"id": "5fa3b0e4-ee23-48fa-8e64-4466d566c02a",
						"type": "ObojoboDraft.Chunks.MCAssessment.MCAnswer",
						"content": {},
						"children": [
							{
								"id": "0002df04-e4b6-495b-8fe8-e10c0bfb2409",
								"type": "ObojoboDraft.Chunks.Text",
								"content": {
									"textGroup": [
										{
											"data": {
												"indent": 0
											},
											"text": {
												"value": "banana",
												"styleList": []
											}
										}
									]
								},
								"children": []
							}
						]
					}
				]
			}
		]
	}

	slateNode.children = node.children.map(child => Common.Registry.getItemForType(CHOICE_NODE).oboToSlate(child))
	slateNode.questionType = questionType

	return slateNode
}

export default { slateToObo, oboToSlate }
