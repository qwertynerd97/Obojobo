import Common from 'obojobo-document-engine/src/scripts/common'
import ViewerComponent from './viewer-component'

import { FEEDBACK_NODE } from '../constants'

Common.Registry.registerModel(FEEDBACK_NODE, {
	adapter: null,
	componentClass: ViewerComponent,
	type: 'chunk'
})
