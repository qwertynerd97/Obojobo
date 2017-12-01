const caliperEvents = require('../../../../routes/api/events/create_caliper_event')(
	null,
	'testHost'
)

const actor = { type: 'user', id: 'testUserId' }
const assessmentId = 'testAssessment'
const attemptId = 'testAttemptId'
const attemptIRI = 'testAttemptIRI'
const draftId = 'testDraftId'
const extensions = { foo: 'bar' }
const frameName = 'testFramename'
const from = 'navigation came from here'
const itemId = 'testItemId'
const questionId = 'testQuestionId'
const targetId = 'testTargetId'
const selectedTargets = { ids: [targetId] }
const score = '50'
const scoreId = '123'
const sessionIds = { sessionId: 'testSessionId', launchId: 'testOboLaunchId' }
const testDate = new Date('2017-08-29T16:57:14.500Z')
const to = 'navigation is going here'

Date = class extends Date {
	constructor() {
		super()
		return testDate
	}
}

describe('Caliper event creator', () => {
	it('createNavigationEvent', () => {
		const navEvent = caliperEvents.createNavigationEvent({
			actor,
			draftId,
			from,
			to,
			sessionIds,
			extensions
		})
		expect(navEvent).toMatchSnapshot()
	})

	it('createNavigationEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createNavigationEvent({
				actor: { type: 'bad' },
				draftId,
				from,
				to,
				sessionIds,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createViewEvent', () => {
		const viewEvent = caliperEvents.createViewEvent({
			actor,
			draftId,
			itemId,
			sessionIds,
			extensions
		})
		expect(viewEvent).toMatchSnapshot()
	})

	it('createViewEvent - sets target of view event when given framename arg', () => {
		const viewEvent = caliperEvents.createViewEvent({
			actor,
			draftId,
			itemId,
			frameName,
			sessionIds,
			extensions
		})
		expect(viewEvent).toMatchSnapshot()
	})

	it('createViewEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createViewEvent({
				actor: { type: 'bad' },
				draftId,
				itemId,
				frameName,
				sessionIds,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createHideEvent', () => {
		const hideEvent = caliperEvents.createHideEvent({
			actor,
			draftId,
			questionId,
			sessionIds,
			extensions
		})
		expect(hideEvent).toMatchSnapshot()
	})

	it('createHideEvent - sets target of hide event when given framename arg', () => {
		const hideEvent = caliperEvents.createHideEvent({
			actor,
			draftId,
			questionId,
			frameName,
			sessionIds,
			extensions
		})
		expect(hideEvent).toMatchSnapshot()
	})

	it('createHideEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createHideEvent({
				actor: { type: 'bad' },
				draftId,
				questionId,
				frameName,
				sessionIds,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createAssessmentAttemptStartedEvent', () => {
		const attemptStarted = caliperEvents.createAssessmentAttemptStartedEvent({
			actor,
			draftId,
			assessmentId,
			attemptId,
			sessionIds,
			extensions
		})
		expect(attemptStarted).toMatchSnapshot()
	})

	it('createAssessmentAttemptStartedEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createAssessmentAttemptStartedEvent({
				actor: { type: 'bad' },
				draftId,
				assessmentId,
				attemptId,
				sessionIds,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createAssessmentAttemptSubmittedEvent', () => {
		const attemptSubmitted = caliperEvents.createAssessmentAttemptSubmittedEvent({
			actor,
			draftId,
			assessmentId,
			attemptId,
			sessionIds,
			extensions
		})
		expect(attemptSubmitted).toMatchSnapshot()
	})

	it('createAssessmentAttemptSubmittedEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createAssessmentAttemptSubmittedEvent({
				actor: { type: 'bad' },
				draftId,
				assessmentId,
				attemptId,
				sessionIds,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createAssessmentAttemptScoredEvent', () => {
		const attemptScored = caliperEvents.createAssessmentAttemptScoredEvent({
			actor: { type: 'serverApp' },
			draftId,
			assessmentId,
			attemptId,
			sessionIds,
			attemptScore: score
		})
		expect(attemptScored).toMatchSnapshot()
	})

	it('createAssessmentAttemptScoredEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createAssessmentAttemptScoredEvent({
				actor: { type: 'bad' },
				draftId,
				assessmentId,
				attemptId,
				sessionIds,
				attemptScore: score
			})
		}).toThrow(`Invalid actor type. Must provide actor of type serverApp`)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createPracticeGradeEvent', () => {
		const practiceGrade = caliperEvents.createPracticeGradeEvent({
			actor: { type: 'viewerClient' },
			draftId,
			questionId,
			scoreId,
			score,
			sessionIds,
			extensions
		})
		expect(practiceGrade).toMatchSnapshot()
	})

	it('createPracticeGradeEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createPracticeGradeEvent({
				actor: { type: 'bad' },
				draftId,
				questionId,
				scoreId,
				score,
				sessionIds,
				extensions
			})
		}).toThrow(`Invalid actor type. Must provide actor of type viewerClient`)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createAssessmentItemEvent', () => {
		const assessmentItem = caliperEvents.createAssessmentItemEvent({
			actor,
			draftId,
			questionId,
			assessmentId,
			attemptId,
			targetId,
			selectedTargets,
			extensions
		})
		expect(assessmentItem).toMatchSnapshot()
	})

	it('createAssessmentItemEvent - when assesmentId is null', () => {
		const assessmentItem = caliperEvents.createAssessmentItemEvent({
			actor,
			draftId,
			questionId,
			assessmentId: null,
			attemptId,
			targetId,
			selectedTargets
		})
		expect(assessmentItem).toMatchSnapshot()
	})

	it('createAssessmentItemEvent - when attemptId is null', () => {
		const assessmentItem = caliperEvents.createAssessmentItemEvent({
			actor,
			draftId,
			questionId,
			assessmentId,
			attemptId: null,
			targetId,
			selectedTargets
		})
		expect(assessmentItem).toMatchSnapshot()
	})

	it('createAssessmentItemEvent - when assessmentId and attemptId are null', () => {
		const assessmentItem = caliperEvents.createAssessmentItemEvent({
			actor,
			draftId,
			questionId,
			assessmentId: null,
			attemptId: null,
			targetId,
			selectedTargets
		})
		expect(assessmentItem).toMatchSnapshot()
	})

	it('createAssessmentItemEvent - when assesmentId, attemptId arguments are not provided', () => {
		const assessmentItem = caliperEvents.createAssessmentItemEvent({
			actor,
			draftId,
			questionId,
			targetId,
			selectedTargets
		})
		expect(assessmentItem).toMatchSnapshot()
	})

	it('createAssessmentItemEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createAssessmentItemEvent({
				actor: { type: 'bad' },
				draftId,
				questionId,
				assessmentId,
				attemptId,
				targetId,
				selectedTargets,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createPracticeQuestionSubmittedEvent', () => {
		const practiceQuestionSubmitted = caliperEvents.createPracticeQuestionSubmittedEvent({
			actor,
			draftId,
			questionId,
			sessionIds,
			extensions
		})
		expect(practiceQuestionSubmitted).toMatchSnapshot()
	})

	it('createPracticeQuestionSubmittedEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createPracticeQuestionSubmittedEvent({
				actor: { type: 'bad' },
				draftId,
				questionId,
				sessionIds,
				extensions
			})
		}).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createPracticeUngradeEvent', () => {
		const practiceUngrade = caliperEvents.createPracticeUngradeEvent({
			actor: { type: 'serverApp' },
			draftId,
			questionId,
			scoreId,
			extensions
		})
		expect(practiceUngrade).toMatchSnapshot()
	})

	it('createPracticeUngradeEvent - throws error given a bad actor', () => {
		expect(() => {
			caliperEvents.createPracticeUngradeEvent({
				actor: { type: 'bad' },
				draftId,
				questionId,
				scoreId,
				extensions
			})
		}).toThrow('Invalid actor type. Must provide actor of type serverApp')
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createViewerAbandonedEvent', () => {
		const viewerAbandoned = caliperEvents.createViewerAbandonedEvent({
			actor,
			draftId,
			sessionIds,
			extensions
		})
		expect(viewerAbandoned).toMatchSnapshot()
	})

	it('createViewerAbandonedEvent  - throws error given a bad actor', () => {
		expect(() =>
			caliperEvents.createViewerAbandonedEvent({
				actor: { type: 'bad' },
				draftId,
				sessionIds,
				extensions
			})
		).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createViewerResumedEvent', () => {
		const viewerResumed = caliperEvents.createViewerResumedEvent({
			actor,
			draftId,
			sessionIds,
			extensions
		})
		expect(viewerResumed).toMatchSnapshot()
	})

	it('createViewerResumedEvent  - throws error given a bad actor', () => {
		expect(() =>
			caliperEvents.createViewerResumedEvent({
				actor: { type: 'bad' },
				draftId,
				sessionIds,
				extensions
			})
		).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createViewerSessionLoggedInEvent', () => {
		const viewerSessionLoggedIn = caliperEvents.createViewerSessionLoggedInEvent({
			actor,
			draftId,
			sessionIds,
			extensions
		})
		expect(viewerSessionLoggedIn).toMatchSnapshot()
	})

	it('createViewerSessionLoggedInEvent  - throws error given a bad actor', () => {
		expect(() =>
			caliperEvents.createViewerSessionLoggedInEvent({
				actor: { type: 'bad' },
				draftId,
				sessionIds,
				extensions
			})
		).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createViewerSessionLoggedOutEvent', () => {
		const viewerSessionLoggedOut = caliperEvents.createViewerSessionLoggedOutEvent({
			actor,
			draftId,
			sessionIds,
			extensions
		})
		expect(viewerSessionLoggedOut).toMatchSnapshot()
	})

	it('createViewerSessionLoggedOutEvent  - throws error given a bad actor', () => {
		expect(() =>
			caliperEvents.createViewerSessionLoggedOutEvent({
				actor: { type: 'bad' },
				draftId,
				sessionIds,
				extensions
			})
		).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})

	///////////////////////////////////////////////////////////////////////////////////////////////////

	it('createPracticeQuestionResetEvent', () => {
		const practiceQuestionReset = caliperEvents.createPracticeQuestionResetEvent({
			actor,
			draftId,
			questionId,
			sessionIds,
			extensions
		})
		expect(practiceQuestionReset).toMatchSnapshot()
	})

	it('createPracticeQuestionResetEvent - throws error given a bad actor', () => {
		expect(() =>
			caliperEvents.createPracticeQuestionResetEvent({
				actor: { type: 'bad' },
				draftId,
				questionId,
				extensions
			})
		).toThrow(
			`Invalid actor type. Must provide actor of type user\nMissing required arguments: actor.id`
		)
	})
})
