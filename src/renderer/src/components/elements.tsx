import React from 'react'
import { RenderElementProps } from 'slate-react'

export const renderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'quote':
      return (
        <blockquote {...props.attributes} className="border-l-4 border-gray-300 pl-4 my-2 italic">
          {props.children}
        </blockquote>
      )
    case 'list-item':
      return <li {...props.attributes}>{props.children}</li>
    case 'list':
      return (
        <ul {...props.attributes} className="list-disc ml-6">
          {props.children}
        </ul>
      )
    case 'code-block':
      return (
        <pre {...props.attributes} className="bg-gray-100 p-2 rounded">
          <code>{props.children}</code>
        </pre>
      )
    default:
      return <p {...props.attributes}>{props.children}</p>
  }
}