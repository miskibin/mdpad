import { RenderElementProps, RenderLeafProps } from 'slate-react'
import cx from 'classnames'
import { styles } from './styles'
import { CustomText } from './types'


export const renderElement = (props: RenderElementProps) => {
  const style = styles[props.element.type as keyof typeof styles] || ''

  switch (props.element.type) {
    case 'quote':
      return (
        <blockquote {...props.attributes} className={style as string}>
          {props.children}
        </blockquote>
      )
    case 'code-block':
      return (
        <pre {...props.attributes} className={style as string}>
          <code>{props.children}</code>
        </pre>
      )
    case 'list':
      return (
        <ul {...props.attributes} className={style as string}>
          {props.children}
        </ul>
      )
    case 'list-item':
      return (
        <li {...props.attributes} className={style as string}>
          {props.children}
        </li>
      )
    default:
      return (
        <p {...props.attributes} className={style as string}>
          {props.children}
        </p>
      )
  }
}

export const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props
  let className = 'transition-colors duration-200'

  const customLeaf = leaf as CustomText

  if (customLeaf.heading) {
    className = cx(
      className,
      styles.heading.base,
      customLeaf.level ? styles.heading[customLeaf.level] : ''
    )
  }

  if (customLeaf.bold) className = cx(className, styles.bold)
  if (customLeaf.italic) className = cx(className, styles.italic)
  if (customLeaf.code) className = cx(className, styles.code)
  if (customLeaf.link) className = cx(className, styles.link)
  if (customLeaf.taskItem) className = cx(className, styles.taskItem)

  return (
    <span {...attributes} className={className}>
      {children}
    </span>
  )
}
