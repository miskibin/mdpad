import React from 'react'
import { RenderLeafProps } from 'slate-react'

export const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props
  let classes = ''

  if ('heading' in leaf && leaf.heading) {
    classes += [
      'font-bold inline-block mt-2 mb-1',
      'level' in leaf && leaf.level === 1 ? 'text-3xl' : '',
      'level' in leaf && leaf.level === 2 ? 'text-2xl' : '',
      'level' in leaf && leaf.level === 3 ? 'text-xl' : '',
      'level' in leaf && leaf.level === 4 ? 'text-lg' : '',
      'level' in leaf && leaf.level === 5 ? 'text-base' : '',
      'level' in leaf && leaf.level === 6 ? 'text-sm' : ''
    ].join(' ')
  }

  if (leaf.bold) classes += ' font-bold'
  if (leaf.italic) classes += ' italic'
  if (leaf.code) classes += ' font-mono bg-gray-200 dark:bg-gray-700 rounded px-1'

  return (
    <span {...attributes} className={classes}>
      {children}
    </span>
  )
}