import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CheckBookTable from './components/CheckBookTable';
import CheckTable from './components/CheckTable';
import CheckFormCreation from './components/CheckFormCreation';
import UpdateCheckBookForm from './components/UpdateCheckBookForm';
import CheckFormUpdate from './components/CheckFormUpdate';
import FormCreation from './components/CheckbookFormCreation';

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <div className='container'>
          <Routes>
            <Route path='/' element={<FormCreation />} />
            <Route path='/checkbooks' element={<CheckBookTable />} />
            <Route path='/checkbooks/:checkbookId/checks' element={<CheckTable />} />
            <Route path='/checkbooks/:checkbookId/checks/new' element={<CheckFormCreation />} />
            <Route path='/checkbooks/:checkbookId/update' element={<UpdateCheckBookForm />} />
            <Route path='/checkbooks/:checkbookId/checks/:checkId/update' element={<CheckFormUpdate />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
