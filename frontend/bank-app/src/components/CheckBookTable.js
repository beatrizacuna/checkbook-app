import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const CheckBookTable = () => {
  const [checkbooks, setCheckbooks] = useState([]);
  const [filteredCheckbooks, setFilteredCheckbooks] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

  const fetchCheckbooks = async () => {
    const response = await api.get('/checkbooks');
    setCheckbooks(response.data);
    setFilteredCheckbooks(response.data);
    setFilterApplied(false);
  };

  const fetchCompleteCheckbooks = async () => {
    const response = await api.get('/complete-checkbooks');
    setFilteredCheckbooks(response.data);
    setFilterApplied(true);
  };

  const handleFilterClick = () => {
    fetchCompleteCheckbooks();
  };

  const handleResetClick = () => {
    fetchCheckbooks();
  };

  const handleDeleteClick = async (checkbookId) => {
    try {
      await api.delete(`/checkbooks/${checkbookId}`);
      fetchCheckbooks();
    } catch (error) {
      console.error('Error deleting checkbook:', error);
    }
  };

  useEffect(() => {
    fetchCheckbooks();
  }, []);

  return (
    <div>
        <h2>Chequeras</h2>
      <div className='mt-3 mb-3'>
        <button className='btn btn-light' onClick={handleFilterClick} style={{ marginRight: '10px' }}>
          Filtrar Chequeras Completas
        </button>
        <button className='btn btn-light' onClick={handleResetClick}>
          Mostrar Todas
        </button>
      </div>

      <table className='table table-striped table-bordered table-hover'>
        <thead>
          <tr>
            <th>Bank Name</th>
            <th>Minimum Range</th>
            <th>Maximum Range</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCheckbooks.map((checkbook) => (
            <tr key={checkbook.id}>
              <td>{checkbook.bank_name}</td>
              <td>{checkbook.min_range}</td>
              <td>{checkbook.max_range}</td>
              <td>
                <Link to={`/checkbooks/${checkbook.id}/checks`}>
                  <button className='btn btn-secondary'>Ver Cheques</button>
                </Link>
                <Link to={`/checkbooks/${checkbook.id}/update`}>
                  <button className='btn btn-secondary' style={{ marginLeft: '5px' }}>
                    Actualizar
                  </button>
                </Link>
                <button
                  className='btn btn-danger'
                  onClick={() => handleDeleteClick(checkbook.id)}
                  style={{ marginLeft: '5px' }} 
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckBookTable;
