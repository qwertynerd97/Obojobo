import './sub-menu.scss'

import Common from 'Common'
import EditorUtil from '../../util/editor-util'
import React from 'react'
import MoreInfoBox from './more-info-box'
import isOrNot from 'obojobo-document-engine/src/scripts/common/util/isornot'
import generatePage from '../../documents/generate-page'

const { Prompt } = Common.components.modal
const { ModalUtil } = Common.util

const { OboModel } = Common.models

class SubMenu extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			isFocused: false,
			currentFocus: 0
		}

		this.menu = []
		this.timeOutId = null

		this.showAddPageModal = this.showAddPageModal.bind(this)
		this.saveId = this.saveId.bind(this)
		this.saveContent = this.saveContent.bind(this)
	}

	deletePage(pageId) {
		EditorUtil.deletePage(pageId)
	}

	renamePage(pageId, label) {
		// Fix page titles that are whitespace strings
		if (!/[^\s]/.test(label)) label = null

		EditorUtil.renamePage(pageId, label)
	}

	movePage(pageId, index) {
		EditorUtil.movePage(pageId, index)
	}

	setStartPage(pageId) {
		EditorUtil.setStartPage(pageId)
	}

	renderLabel(label) {
		return <span>{label}</span>
	}

	renderLinkButton(label, ariaLabel, refId) {
		return (
			<button
				ref={item => {
					this.linkButton = item
					return refId
				}}
				aria-label={ariaLabel}
			>
				{this.renderLabel(label)}
			</button>
		)
	}

	renderNewItemButton(pageId) {
		return (
			<div className="add-page">
				<button onClick={() => this.showAddPageModal(pageId)}>+ Page</button>
			</div>
		)
	}

	showAddPageModal(pageId) {
		ModalUtil.show(
			<Prompt
				title="Add Page"
				message="Enter the title for the new page:"
				onConfirm={this.addPage.bind(this, pageId)}
			/>
		)
	}

	addPage(afterPageId, title = null) {
		ModalUtil.hide()

		const newPage = generatePage()
		newPage.content.title = this.isWhiteSpace(title) ? null : title
		EditorUtil.addPage(newPage, afterPageId)
		this.setState({ navTargetId: newPage.id })
	}

	isWhiteSpace(str) {
		return !/[\S]/.test(str)
	}

	saveId(oldId, newId) {
		const model = OboModel.models[oldId]
		if (!model.setId(newId)) return 'The id "' + newId + '" already exists. Please choose a unique id'

		EditorUtil.rebuildMenu(OboModel.getRoot())

		this.setState({ navTargetId: newId })
	}

	saveContent(oldContent, newContent) {
		const item = this.props.list[this.props.index]
		const model = OboModel.models[item.id]

		model.set({ content: newContent })
		model.triggers = newContent.triggers ? newContent.triggers : []
		model.title =
			newContent.title || model.title ? this.renamePage(item.id, newContent.title) : null
	}

	render() {
		const { index, isSelected, list } = this.props
		const item = list[index]
		const isFirstInList = !list[index - 1]
		const isLastInList = !list[index + 1]

		const className =
			'editor--editor-nav--submenu link' +
			isOrNot(isSelected, 'selected') +
			isOrNot(item.flags.assessment, 'assessment') +
			isOrNot(isFirstInList, 'first-in-list') +
			isOrNot(isLastInList, 'last-in-list')

		let ariaLabel = item.label
		if (item.contentType) {
			ariaLabel = item.contentType + ': ' + ariaLabel
		}
		if (isSelected) {
			ariaLabel = 'Currently on ' + ariaLabel
		} else {
			ariaLabel = 'Go to ' + ariaLabel
		}

		const model = OboModel.models[item.id]

		return (
			<li onClick={this.props.onClick} className={className}>
				{this.renderLinkButton(item.label, ariaLabel, item.id)}
				{isSelected ? (
					<MoreInfoBox
						id={item.id}
						content={model.get('content')}
						saveId={this.saveId}
						saveContent={this.saveContent}
						savePage={this.props.savePage}
					/>
				) : null}
				{isSelected && !item.flags.assessment ? this.renderNewItemButton(item.id) : null}
			</li>
		)
	}
}

export default SubMenu