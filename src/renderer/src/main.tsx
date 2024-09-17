import './assets/index.css'
import '@mdxeditor/editor/style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MDXEditor } from '@mdxeditor/editor'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
