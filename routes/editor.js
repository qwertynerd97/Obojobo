var express = require('express')
var router = express.Router()
var db = require('../db')

let displayEditor = (req, res, next) => {
	return req
		.getCurrentUser(true)
		.then(user => {
			if (user.isGuest()) {
				return Promise.reject(new Error('Login Required'))
			}
			if (!user.canViewEditor) {
				return next()
			}

			return db
				.any(
					`
			SELECT DISTINCT ON (draft_id)
				draft_id AS "draftId",
				id AS "latestVersion",
				created_at AS "createdAt",
				content,
				xml
			FROM drafts_content
			WHERE draft_id IN (
				SELECT id
				FROM drafts
				WHERE deleted = FALSE
				AND user_id = $[userId]
			)
			ORDER BY draft_id, created_at desc
		`,
					{
						userId: user.id
					}
				)
				.then(drafts => {
					res.render('editor', { drafts: drafts })
				})
		})
		.catch(error => {
			next(error)
		})
}

// Display the Document Editor
// mounted as /editor
router.post('/', displayEditor)
router.get('/', displayEditor)

module.exports = router
