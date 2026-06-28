import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import './Pastes.css';
import Pastes from './Pastes';
import MainPage from './MainPage';
import ProfilePage from "./pages/ProfilePage";
import ConverterPage from "./pages/ConverterPage";
import CompressPage from "./pages/CompressPage";
import DropPage from "./pages/DropPage";

function App(){
  return (
    <Router>
    <Routes>
        
      <Route path="" element={<MainPage/>}/>
      <Route path="/api/profile" element={<ProfilePage/>}/>
      <Route path="/api/pastes" element={<Pastes/>}/>
      <Route path="/api/converter" element={<ConverterPage/>}/>
      <Route path="/api/compress" element={<CompressPage/>}/>
      <Route path="/api/droppage" element={<DropPage/>}/>
    </Routes>
    </Router>
  );
}

export default App;
