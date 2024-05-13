import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider,createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Home from './home.tsx'
const router=createBrowserRouter([
  {
    path:'/start',
    element:<App/>
  },
  {
    path:'/',
    element:<Home/>
  }
])
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <RouterProvider router={router}/>
  </React.StrictMode>,
)
