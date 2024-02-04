import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const CheckTable = () => {
  const { checkbookId } = useParams();
  const [checks, setChecks] = useState([]);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const response = await api.get(`/${checkbookId}/checks`);
        setChecks(response.data);
      } catch (error) {
        console.error('Error fetching checks:', error);
      }
    };

    fetchChecks();
  }, [checkbookId]);

  const handleDeleteClick = async (checkId) => {
    try {
      await api.delete(`/${checkbookId}/checks/${checkId}`);
      const response = await api.get(`/${checkbookId}/checks`);
      setChecks(response.data);
    } catch (error) {
      console.error('Error deleting check:', error);
    }
  };

  return (
    <div>
      <h2>Cheques asociados</h2>
      <div className='mb-3 mt-3'>
        <Link to={`/checkbooks/${checkbookId}/checks/new`} className="btn btn-primary">
          Crear Nuevo Cheque
        </Link>
      </div>
      <table className='table table-striped table-bordered table-hover'>
        <thead>
          <tr>
            <th>Número de Cheque</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id}>
              <td>{check.check_number}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteClick(check.id)}
                >
                  Eliminar
                </button>
                <Link to={`/checkbooks/${checkbookId}/checks/${check.id}/update`}>
                  <button className='btn btn-secondary' style={{ marginLeft: '5px' }}>
                    Actualizar
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  
    </div>
  );
};

export default CheckTable;
