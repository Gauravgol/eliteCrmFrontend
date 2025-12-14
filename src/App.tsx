import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from "react-router-dom";
import './App.css'


import Login from './components/Login'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Projects from './components/Projects/Projects'
import NewProject from './components/NewProjects/NewProject';
function App() {
  return (
    <>
      {/* Layout */}
      <Navbar />
      <Sidebar />

      {/* Pages */}
      
        <Routes>
          <Route path="/" element={<Projects />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
        </Routes>
       </>
  );
}

export default App
