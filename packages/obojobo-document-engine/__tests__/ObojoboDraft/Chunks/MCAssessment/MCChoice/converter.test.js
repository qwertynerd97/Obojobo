jest.mock('Common', () => ({
	Store: {
		getItemForType: () => ({
			slateToObo: jest.fn(),
			oboToSlate: jest.fn()
		})
	}
}))

import Converter from 'ObojoboDraft/Chunks/MCAssessment/MCChoice/converter'
const MCFEEDBACK_NODE = 'ObojoboDraft.Chunks.MCAssessment.MCFeedback'
const MCANSWER_NODE = 'ObojoboDraft.Chunks.MCAssessment.MCAnswer'

describe('MCChoice editor', () => {
	test('slateToObo converts a Slate node to an OboNode with content', () => {
		const slateNode = {
			key: 'mockKey',
			type: 'mockType',
			data: {
				get: () => null
			},
			nodes: [
				{
					type: MCANSWER_NODE
				},
				{
					type: MCFEEDBACK_NODE
				},
				{
					type: 'notADefinedNode'
				}
			]
		}
		const oboNode = Converter.slateToObo(slateNode)

		expect(oboNode).toMatchSnapshot()
	})

	test('oboToSlate converts an OboNode to a Slate node', () => {
		const oboNode = {
			id: 'mockKey',
			type: 'mockType',
			children: [
				{
					type: MCANSWER_NODE
				},
				{
					type: MCFEEDBACK_NODE
				},
				{
					type: 'notADefinedNode'
				}
			]
		}
		const slateNode = Converter.oboToSlate(oboNode)

		expect(slateNode).toMatchSnapshot()
	})
})
