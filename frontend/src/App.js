import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/Register";
import Home from "./components/Home";
import Input from "./components/Input";
import HomeAdmin from "./components/HomeAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/input" element={<Input/>} />
        <Route path="/HomeAdmin" element={<HomeAdmin/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
