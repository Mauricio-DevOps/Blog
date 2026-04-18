'use client'

import type { ToolbarGroup, ToolbarGroupItem } from '@payloadcms/richtext-lexical'
import { $isUploadNode, createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $createNodeSelection,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  type BaseSelection,
  type LexicalEditor,
} from 'lexical'
import type { CSSProperties } from 'react'

type MoveDirection = 'down' | 'up'

const buttonStyle: CSSProperties = {
  alignItems: 'center',
  background: 'transparent',
  border: '1px solid var(--theme-elevation-150, rgba(255, 255, 255, 0.12))',
  borderRadius: '0.4rem',
  color: 'inherit',
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  gap: '0.35rem',
  height: '2rem',
  justifyContent: 'center',
  minWidth: '2rem',
  padding: '0 0.55rem',
}

const disabledButtonStyle: CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.45,
}

const iconStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.8rem',
  fontWeight: 600,
  lineHeight: 1,
}

function getSelectedUploadNode(selection: BaseSelection | null) {
  if (!$isNodeSelection(selection) || !selection.getNodes().length) {
    return null
  }

  const firstNode = selection.getNodes()[0]

  return $isUploadNode(firstNode) ? firstNode : null
}

function canMoveSelectedUpload(selection: BaseSelection | null, direction: MoveDirection) {
  const uploadNode = getSelectedUploadNode(selection)

  if (!uploadNode) {
    return false
  }

  return direction === 'up'
    ? Boolean(uploadNode.getPreviousSibling())
    : Boolean(uploadNode.getNextSibling())
}

function moveSelectedUpload(editor: LexicalEditor, direction: MoveDirection) {
  editor.update(() => {
    const uploadNode = getSelectedUploadNode($getSelection())

    if (!uploadNode) {
      return
    }

    const sibling =
      direction === 'up' ? uploadNode.getPreviousSibling() : uploadNode.getNextSibling()

    if (!sibling) {
      return
    }

    if (direction === 'up') {
      sibling.insertBefore(uploadNode)
    } else {
      sibling.insertAfter(uploadNode)
    }

    const selection = $createNodeSelection()
    selection.add(uploadNode.getKey())
    $setSelection(selection)
  })
}

function createMoveItem(direction: MoveDirection, label: string, icon: string): ToolbarGroupItem {
  const MoveButton: NonNullable<ToolbarGroupItem['Component']> = ({ editor, enabled }) => {
    return (
      <button
        aria-label={label}
        disabled={!enabled}
        onClick={() => {
          moveSelectedUpload(editor, direction)
        }}
        style={enabled ? buttonStyle : { ...buttonStyle, ...disabledButtonStyle }}
        title={label}
        type="button"
      >
        <span aria-hidden="true" style={iconStyle}>
          {icon}
        </span>
      </button>
    )
  }

  return {
    Component: MoveButton,
    isEnabled: ({ selection }) => canMoveSelectedUpload(selection, direction),
    key: `uploadMove${direction === 'up' ? 'Up' : 'Down'}`,
    label,
  }
}

const toolbarGroups: ToolbarGroup[] = [
  {
    items: [
      createMoveItem('up', 'Mover imagem para cima', 'UP'),
      createMoveItem('down', 'Mover imagem para baixo', 'DN'),
    ],
    key: 'upload-order',
    order: 31,
    type: 'buttons',
  },
]

export const UploadReorderFeatureClient = createClientFeature({
  toolbarFixed: {
    groups: toolbarGroups,
  },
})
