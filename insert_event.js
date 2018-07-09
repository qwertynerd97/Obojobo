const db = oboRequire('db')

module.exports = insertObject => {
	console.log('going to insert event now', insertObject)
	return db
		.one(
			`
		INSERT INTO events
		(actor_time, action, actor, ip, metadata, payload, draft_id, draft_content_id, version, is_preview)
		VALUES ($[actorTime], $[action], $[userId], $[ip], $[metadata], $[payload], $[draftId], $[contentId], $[eventVersion], $[preview])
		RETURNING created_at`,
			insertObject
		)
		.then(createdAt => {
			console.log('inserting caliper')
			if (insertObject.caliperPayload) {
				db.none(
					`
					INSERT INTO caliper_store
					(payload, is_preview)
					VALUES ($[caliperPayload], $[preview])`,
					insertObject
				)
			}

			return createdAt
		})
}
