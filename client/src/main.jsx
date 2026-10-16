import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import Socket from './component/Socket.jsx';

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
  <Socket>
   <App />
  </Socket>
  </BrowserRouter>
    
)
