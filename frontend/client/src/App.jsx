import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import './Pastes.css';
import Pastes from './Pastes';
import MainPage from './MainPage';
import ProfilePage from "./pages/ProfilePage";
import ConverterPage from "./pages/ConverterPage";
import CompressPage from "./pages/CompressPage";
import DropPage from "./pages/DropPage";
import EditPastePage from "./pages/EditPastePage";
import ViewPastePage from "./pages/ViewPaste";
import AboutPage from "./pages/AboutPage";
import TermsofService from "./pages/termsofservice";
import ContactsPage from "./pages/contacts";
import PolicyPage from "./pages/policypage";
import DownloadPage from "./pages/DownloadPage";
function App(){
  return (
    <Router>
    <Routes>
        
      <Route path="" element={<MainPage/>}/>
      <Route path="/api/profile/" element={<ProfilePage/>}/>
      <Route path="/api/pastes/" element={<Pastes/>}/>
      <Route path="/api/converter/" element={<ConverterPage/>}/>
      <Route path="/api/compress/" element={<CompressPage/>}/>
      <Route path="/api/droppage/" element={<DropPage/>}/>
      <Route path="/api/pastes/edit/:pasteCode/" element={<EditPastePage/>}/>
      <Route path="/api/pastes/view/:pasteCode/" element={<ViewPastePage/>}/>
      <Route path="/api/about/" element={<AboutPage/>}/>
      <Route path="/api/termsofservice/" element={<TermsofService/>}/>
      <Route path="/api/contacts/" element={<ContactsPage/>}/>
      <Route path="/api/policy/" element={<PolicyPage/>}/>
      <Route path="/api/droppage/:fileCode/" element={<DownloadPage />} />
    </Routes>
    </Router>
  );
}

export default App;
