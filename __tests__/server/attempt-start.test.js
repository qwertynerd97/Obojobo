jest.mock('../../server/assessment')
const _ = require('underscore')
const AS = require('../../server/attempt-start.js')
const {
	startAttempt,
	getQuestionBankProperties,
	createAssessmentUsedQuestionMap,
	initAssessmentUsedQuestions,
	chooseUnseenQuestionsSequentially,
	chooseAllQuestionsRandomly,
	chooseUnseenQuestionsRandomly,
	createChosenQuestionTree,
	getNodeQuestions,
	getSendToClientPromises,
	insertAttemptStartCaliperEvent
} = require('../../server/attempt-start.js')
const testJson = require('../../test-object.json')
const Assessment = require('../../server/assessment')
const insertEvent = oboRequire('insert_event')
const db = oboRequire('db')
const Draft = oboRequire('models/draft')
const DraftNode = oboRequire('models/draft_node')
const createCaliperEvent = oboRequire('routes/api/events/create_caliper_event')
const logAndRespondToUnexpected = require('../../server/util').logAndRespondToUnexpected

const QUESTION_BANK_NODE_TYPE = 'ObojoboDraft.Chunks.QuestionBank'
const QUESTION_NODE_TYPE = 'ObojoboDraft.Chunks.Question'
const ERROR_ATTEMPT_LIMIT_REACHED = 'Attempt limit reached'
const ERROR_UNEXPECTED_DB_ERROR = 'Unexpected DB error'

describe('start attempt route', () => {
	let mockDraft
	let mockUsedQuestionMap
	let mockReq
	let mockRes

	let mockGetChildNodeByIdForRootNode = () => {
		// mock the initial request to get the root node
		mockDraft.getChildNodeById.mockReturnValueOnce({
			immediateChildrenSet: mockUsedQuestionMap.keys()
		})
	}

	beforeEach(() => {
		mockDraft = new Draft(testJson)
		mockUsedQuestionMap = new Map()

		mockUsedQuestionMap.set('qb1', 0)
		mockUsedQuestionMap.set('qb1.q1', 0)
		mockUsedQuestionMap.set('qb1.q2', 0)
		mockUsedQuestionMap.set('qb2', 0)
		mockUsedQuestionMap.set('qb2.q1', 0)
		mockUsedQuestionMap.set('qb2.q2', 0)

		mockReq = {}
		mockRes = {}
	})

	it('can retrieve question bank properties with attributes set', () => {
		const mockQuestionBankNode = new DraftNode({}, { content: { choose: 2, select: 'test' } }, {})
		const qbProperties = getQuestionBankProperties(mockQuestionBankNode.node)

		expect(Object.keys(qbProperties).length).toBe(2)
		expect(qbProperties.choose).toBe(2)
		expect(qbProperties.select).toBe('test')
	})

	it('can retrieve question bank properties with NO attributes set', () => {
		const mockQuestionBankNode = new DraftNode({}, { content: {} }, {})
		const qbProperties = getQuestionBankProperties(mockQuestionBankNode.node)

		expect(Object.keys(qbProperties).length).toBe(2)
		expect(qbProperties.choose).toBe(Infinity)
		expect(qbProperties.select).toBe('sequential')
	})

	it('can initialize a map to track use of assessment questions', () => {
		const mockAssessmentProperties = {
			nodeChildrenIds: ['qb1', 'qb1.q1', 'qb1.q2', 'qb2', 'qb2.q1', 'qb2.q2'],
			draftTree: mockDraft
		}

		// mock child lookup
		mockDraft.getChildNodeById.mockReturnValue({ node: { type: 'ObojoboDraft.Chunks.Question' } })

		const usedQuestionMap = createAssessmentUsedQuestionMap(mockAssessmentProperties)

		expect(usedQuestionMap.constructor).toBe(Map)
		expect(usedQuestionMap.size).toBe(6)
		expect(usedQuestionMap.get('qb1')).toBe(0)
		expect(usedQuestionMap.get('qb1.q1')).toBe(0)
		expect(usedQuestionMap.get('qb1.q2')).toBe(0)
		expect(usedQuestionMap.get('qb2')).toBe(0)
		expect(usedQuestionMap.get('qb2.q1')).toBe(0)
		expect(usedQuestionMap.get('qb2.q2')).toBe(0)
	})

	it('can track use of assessment questions using an initialized question map', () => {
		const fakeChildNodes = [{ id: 'qb1.q1', children: [] }, { id: 'qb1.q2', children: [] }]
		const mockQbTree = { id: 'qb1', children: fakeChildNodes }

		initAssessmentUsedQuestions(mockQbTree, mockUsedQuestionMap)

		expect(mockUsedQuestionMap.get('qb1')).toBe(1)
		expect(mockUsedQuestionMap.get('qb1.q1')).toBe(1)
		expect(mockUsedQuestionMap.get('qb1.q2')).toBe(1)
		expect(mockUsedQuestionMap.get('qb2')).toBe(0)
		expect(mockUsedQuestionMap.get('qb2.q1')).toBe(0)
		expect(mockUsedQuestionMap.get('qb2.q2')).toBe(0)
	})

	// @TODO: @Zach - I'm not sure if my mocking of the datasets makes sense
	// the results being returned are including the qb as the first index?
	it('can choose to display unseen question banks and questions sequentially', () => {
		const mockAssessmentProperties = {
			oboNode: { draftTree: mockDraft },
			questionUsesMap: mockUsedQuestionMap
		}

		mockUsedQuestionMap.set('qb2', 1)
		mockUsedQuestionMap.set('qb2.q1', 1)
		mockUsedQuestionMap.set('qb2.q2', 1)

		// mock most requests to get each question (by default)
		mockDraft.getChildNodeById.mockImplementation(id => ({ toObject: () => `fakeObject-${id}` }))

		// Choosing questions where numQuestionsPerAttempt is 0 (no quesitons should be chosen).
		mockGetChildNodeByIdForRootNode()
		expect(chooseUnseenQuestionsSequentially(mockAssessmentProperties, 'qb1', 0)).toEqual([])

		// Case to test sorting of question banks (qb1 should come first).
		mockGetChildNodeByIdForRootNode()
		expect(chooseUnseenQuestionsSequentially(mockAssessmentProperties, 'qb', 3)).toEqual([
			'fakeObject-qb1',
			'fakeObject-qb1.q1',
			'fakeObject-qb1.q2'
		])

		// Choosing questions where numQuestionsPerAttempt = 1.
		mockGetChildNodeByIdForRootNode()
		expect(chooseUnseenQuestionsSequentially(mockAssessmentProperties, 'qb1', 1)).toEqual([
			'fakeObject-qb1'
		])

		// Choosing questions where numQuestionsPerAttempt is more than 1.
		mockGetChildNodeByIdForRootNode()
		expect(chooseUnseenQuestionsSequentially(mockAssessmentProperties, 'qb1', 3)).toEqual([
			'fakeObject-qb1',
			'fakeObject-qb1.q1',
			'fakeObject-qb1.q2'
		])

		// Case where questions need to be reordered (q2 should now come first).
		mockGetChildNodeByIdForRootNode()
		mockUsedQuestionMap.set('qb1.q1', 1)
		expect(chooseUnseenQuestionsSequentially(mockAssessmentProperties, 'qb1', 3)).toEqual([
			'fakeObject-qb1',
			'fakeObject-qb1.q2',
			'fakeObject-qb1.q1'
		])
	})

	it('can choose to display all question banks and questions randomly', () => {
		_.shuffle = jest.fn(() => ['qb2', 'qb1'])

		const mockAssessmentProperties = {
			oboNode: { draftTree: mockDraft },
			questionUsesMap: {}
		}

		// mock most requests to get each question (by default)
		mockDraft.getChildNodeById.mockImplementation(id => ({ toObject: () => `fakeObject-${id}` }))

		mockGetChildNodeByIdForRootNode()
		expect(chooseAllQuestionsRandomly(mockAssessmentProperties, 'qb', 2)).toEqual([
			'fakeObject-qb2',
			'fakeObject-qb1'
		])
		expect(_.shuffle).toHaveBeenCalled()
	})

	it('can choose to display unseen question banks and questions randomly', () => {
		Math.random = jest.fn(() => 1)
		// Unseen questions will come first, if we've seen an equal
		// number of times, we use Math.random.
		mockUsedQuestionMap.set('qb1', 1)
		mockUsedQuestionMap.set('qb2', 1)

		const mockAssessmentProperties = {
			oboNode: { draftTree: mockDraft },
			questionUsesMap: mockUsedQuestionMap
		}

		// mock most requests to get each question (by default)
		mockDraft.getChildNodeById.mockImplementation(id => ({ toObject: () => `fakeObject-${id}` }))

		mockGetChildNodeByIdForRootNode()
		expect(chooseUnseenQuestionsRandomly(mockAssessmentProperties, 'qb', 2)).toEqual([
			'fakeObject-qb2.q2',
			'fakeObject-qb2.q1'
		])
		expect(Math.random).toHaveBeenCalled()
	})

	// select options are added to attempt-start.
	it.skip('can create a tree of chosen question banks/questions appropriate to a specified choose property', () => {
		let n = 0
		const newQ = () => {
			let q = new DraftNode()
			q.id = `q-${n++}`
			q.type = 'ObojoboDraft.Chunks.Question'
			return q
		}
		const newQb = (children = []) => {
			let q = new DraftNode()
			q.id = `qb-${n++}`
			q.type = 'ObojoboDraft.Chunks.QuestionBank'
			q.children = children
			q.content = {}
			q.draftTree
			return q
		}

		const node = new DraftNode({ getChildNodeById: jest.fn(id => `q${id}`) })
		const q1 = newQ()
		const q2 = newQ()
		const q3 = newQ()
		const q4 = newQ()
		const q5 = newQ()
		const q6 = newQ()
		const qb1 = newQb([q1, q2, q3])
		const qb2 = newQb([q4, q5, q6])
		q6.type = 'not-a-question'
		node.children = [qb1, qb2]

		// mock most requests to get each question (by default)
		node.draftTree.getChildNodeById.mockImplementation(id => ({
			toObject: () => `fakeObject-${id}`
		}))

		// Choosing questions where numQuestionsPerAttempt is 0 (no quesitons should be chosen).
		node.draftTree.getChildNodeById.mockReturnValueOnce({ immediateChildrenSet: [] })

		createChosenQuestionTree(node, { oboNode: node })

		// Question bank should now only have qb1 (choose is 1 and qb1 is next up sequentially)
		expect(assessmentQbTree.id).toBe('qb')
		expect(assessmentQbTree.children.length).toBe(1)
		expect(assessmentQbTree.children[0].id).toBe('qb1')

		// Reset qb tree and check if random-all works appropriately when called
		// through createChosenQuestionTree.
		assessmentQbTree = assessmentNode.children[1].toObject()
		assessmentQbTree.content.select = 'random-all'
		_.shuffle = jest.fn(() => ['qb2', 'qb1'])
		createChosenQuestionTree(assessmentQbTree, mockAssessmentProperties)
		expect(_.shuffle).toHaveBeenCalled()

		// Reset qb tree and check if random-unseen works appropriately when called
		// through createChosenQuestionTree
		assessmentQbTree = assessmentNode.children[1].toObject()
		assessmentQbTree.content.select = 'random-unseen'

		mockUsedQuestionMap.set('qb1', 2)
		mockUsedQuestionMap.set('qb1.q1', 2)
		mockUsedQuestionMap.set('qb1.q2', 2)

		// qb2 should come first here (it is next up in unseen priority)
		createChosenQuestionTree(assessmentQbTree, mockAssessmentProperties)
		expect(assessmentQbTree.children.map(node => node.id)).toEqual(['qb2'])
	})

	it('can retrieve an array of question type nodes from a node tree', () => {
		let n = 0
		const newQ = () => {
			let q = new DraftNode()
			q.id = n++
			q.type = 'ObojoboDraft.Chunks.Question'
			return q
		}

		const node = new DraftNode({ getChildNodeById: jest.fn(id => `q${id}`) })
		const q1 = newQ()
		const q2 = newQ()
		const q3 = newQ()
		const q4 = newQ()
		const q5 = newQ()
		const q6 = newQ()
		node.children = [q1, q5]
		q1.children = [q2, q3]
		q2.children = [q4, q6]
		q6.type = 'not-a-question'

		const questions = getNodeQuestions(node, node, [])

		expect(questions).toHaveLength(5)
		expect(questions).toEqual(['q0', 'q1', 'q3', 'q2', 'q4'])
	})

	it('getSendToClientPromises calls and returns array of yell results from all questions', () => {
		const attemptState = { questions: [] }
		expect(getSendToClientPromises(attemptState, {}, {})).toEqual([])

		let n = 0
		let mockYell = jest.fn(() => n++)
		attemptState.questions = [{ yell: mockYell }, { yell: mockYell }]

		let result = getSendToClientPromises(attemptState, 'mockReq', 'mockRes')
		// yell is called?
		expect(mockYell).toHaveBeenCalledTimes(2)
		expect(mockYell).toHaveBeenCalledWith(
			'ObojoboDraft.Sections.Assessment:sendToAssessment',
			'mockReq',
			'mockRes'
		)

		// returns from yell come back?
		expect(result).toEqual([0, 1])
	})

	test('startAttempt inserts a new attempt, creates events and replies with an expected object', () => {
		const createAssessmentAttemptStartedEvent = jest.fn().mockReturnValue('mockCaliperPayload')
		insertEvent.mockReturnValueOnce('mockInsertResult')
		createCaliperEvent.mockReturnValueOnce({
			createAssessmentAttemptStartedEvent
		})
		Date.prototype.toISOString = () => 'date'

		const r = insertAttemptStartCaliperEvent(
			'mockAttemptId',
			1,
			'mockUserId',
			'mockDraftId',
			'mockAssessmentId',
			true,
			'mockHostname',
			'mockRemoteAddress'
		)

		// Make sure we get the result of insertEvent back
		expect(r).toBe('mockInsertResult')

		// Make sure insertEvent was called
		expect(insertEvent).toHaveBeenCalledTimes(1)

		expect(createAssessmentAttemptStartedEvent).toHaveBeenCalledWith({
			actor: {
				id: 'mockUserId',
				type: 'user'
			},
			assessmentId: 'mockAssessmentId',
			attemptId: 'mockAttemptId',
			draftId: 'mockDraftId',
			extensions: {
				count: 1
			},
			isPreviewMode: true
		})

		expect(insertEvent).toHaveBeenCalledWith({
			action: 'assessment:attemptStart',
			actorTime: 'date',
			caliperPayload: 'mockCaliperPayload',
			draftId: 'mockDraftId',
			eventVersion: '1.1.0',
			ip: 'mockRemoteAddress',
			metadata: {},
			payload: {
				attemptCount: 1,
				attemptId: 'mockAttemptId'
			},
			userId: 'mockUserId'
		})
	})

	test('calling startAttempt when no attempts remain rejects with an expected error', done => {
		mockReq = {
			requireCurrentUser: jest.fn(() =>
				Promise.resolve({
					user: {
						canViewEditor: true
					}
				})
			),
			body: {
				draftId: 'mockDraftId',
				assessmentId: 'mockAssessmentId'
			}
		}

		mockRes = { reject: jest.fn() }

		const mockAssessmentNode = {
			getChildNodeById: jest.fn(() => ({
				node: {
					content: {
						// Number of attempts the user is allowed (what we're testing here).
						attempts: 1
					}
				},
				children: [
					{},
					{
						childrenSet: ['test', 'test1'],
						toObject: jest.fn()
					}
				]
			}))
		}

		Draft.fetchById = jest.fn(() => Promise.resolve(mockAssessmentNode))
		Assessment.getNumberAttemptsTaken = jest.fn(() => 1)

		startAttempt(mockReq, mockRes).then(() => {
			expect(mockRes.reject).toHaveBeenCalledWith(ERROR_ATTEMPT_LIMIT_REACHED)
			done()
		})
	})

	test('an unexpected error in startAttempt calls logAndRespondToUnexpected with expected values', done => {
		mockReq = {
			requireCurrentUser: jest.fn(() =>
				Promise.resolve({
					user: {
						canViewEditor: true
					}
				})
			)
		}

		mockRes = { unexpected: jest.fn() }

		Draft.fetchById = jest.fn(() => {
			throw new Error(ERROR_UNEXPECTED_DB_ERROR)
		})

		startAttempt(mockReq, mockRes).then(() => {
			expect(mockRes.unexpected).toHaveBeenCalledWith(ERROR_UNEXPECTED_DB_ERROR)
			done()
		})
	})
})
