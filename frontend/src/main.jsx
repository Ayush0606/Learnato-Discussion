import React from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './styles.css'

const token = localStorage.getItem('token')
if(token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

createRoot(document.getElementById('root')).render(<App />)
