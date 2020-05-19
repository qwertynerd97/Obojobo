jest.mock('obojobo-document-engine/src/scripts/common/index', () => ({
	Registry: {
		registerModel: jest.fn()
	}
}))

jest.mock('./viewer-component', () => ({}))

const Common = require('obojobo-document-engine/src/scripts/common/index')
import { FEEDBACK_NODE } from '../constants'

// include the script we're testing, it registers the model
import './viewer'
import ViewerComponent from './viewer-component'

describe('ObojoboDraft.Chunks.AbstractAssessment.Feedback registration', () => {
	test('registerModel registers expected vars', () => {
		const register = Common.Registry.registerModel.mock.calls[0]
		expect(register[0]).toBe(FEEDBACK_NODE)
		expect(register[1]).toHaveProperty('type', 'chunk')
		expect(register[1]).toHaveProperty('adapter', null)
		expect(register[1]).toHaveProperty('componentClass', ViewerComponent)
	})
})
