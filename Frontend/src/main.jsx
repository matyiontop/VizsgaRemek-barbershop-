import React from 'react'
import ReactDOM from 'react-dom/client'
import Menu from './Menu.jsx'
import { CustomProvider } from 'rsuite';

import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomProvider>
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    </CustomProvider>
  </React.StrictMode>,
)
