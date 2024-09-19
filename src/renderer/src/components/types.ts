import { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

export type ParagraphElement = { type: 'paragraph'; children: CustomText[] }
export type QuoteElement = { type: 'quote'; children: CustomText[] }
export type ListItemElement = { type: 'list-item'; children: CustomText[] }
export type ListElement = { type: 'list'; children: ListItemElement[] }
export type CodeBlockElement = { type: 'code-block'; children: CustomText[] }

export type CustomElement = ParagraphElement | QuoteElement | ListItemElement | ListElement | CodeBlockElement

export type FormattedText = { text: string; bold?: boolean; italic?: boolean; code?: boolean }
export type CustomText = FormattedText

export interface CustomRange {
  anchor: { path: number[]; offset: number }
  focus: { path: number[]; offset: number }
  heading?: boolean
  level?: number
  bold?: boolean
  italic?: boolean
  code?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

export const initialValue: Descendant[] = [
  { type: 'paragraph', children: [{ text: 'Start typing here...' }] }
]