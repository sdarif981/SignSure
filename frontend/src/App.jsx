import { BrowserRouter, Route,  Routes } from "react-router-dom"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Navbar from "./components/pages/Navbar"
import Home from "./components/pages/Home"
import SignDocument from "./components/pages/SignDocument"
import About from "./components/pages/About"
import Contact from "./components/pages/Contact"
import VerifyDocument from "./components/pages/VerifyDocument"
import Protected from "./components/pages/Protected"




function App() {
 return <>
 <BrowserRouter>
  <div className="flex flex-col min-h-screen">
 
   <div className="flex-grow">
    <Routes>
      <Route path="/login" element={<Login/>} />
       <Route path="/register" element={<Register/>} />
       <Route path="/" element={<Home/>}/>
       <Route path="/sign-page" element={<Protected><SignDocument/></Protected>}/>
       <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/verify-page" element={<Protected><VerifyDocument/></Protected>}/>
    </Routes>
   </div>
  </div>
 </BrowserRouter>
 </>
}

export default App
