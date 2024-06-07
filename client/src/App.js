import './App.css';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Subscribe from './pages/Subscribe';
import Redirect from './pages/Redirect';
import Unsubscribe from './pages/Unsubscribe';


function App() {


  return (
    <div >
      <Router>
        <nav>
          <img src='/img/gos.png' alt='icon' />
          <div id='linkNav'>
            <Link to="/">Home</Link>
            <Link to="/subscribe">Subscribe</Link>
            <Link to="/unsubscribe">Unsubscribe</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/subscribe" exact element={<Subscribe />} />
          <Route path="/redirect" exact element={<Redirect />} />
          <Route path='/unsubscribe' element={<Unsubscribe />} />
        </Routes>
      </Router>

    </div>
  );
}

export default App;
