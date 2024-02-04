import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const CheckFormUpdate = () => {
  const { checkbookId, checkId } = useParams();
  const [formData, setFormData] = useState({
    check_number: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [checkbookInfo, setCheckbookInfo] = useState(null);

  useEffect(() => {
    const fetchCheckData = async () => {
      try {
        const checkbookResponse = await api.get(`/checkbooks/${checkbookId}`);
        setCheckbookInfo(checkbookResponse.data);

        const checkResponse = await api.get(`/${checkbookId}/checks/${checkId}`);
        const { check_number } = checkResponse.data;
        setFormData({ check_number });
      } catch (error) {
        console.error('Error fetching check data:', error);
      }
    };

    fetchCheckData();
  }, [checkbookId, checkId]);

  const handleInputChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.get(`/${checkbookId}/checks`);
      const existingCheckNumbers = response.data.map((check) => check.check_number);

      if (existingCheckNumbers.includes(Number(formData.check_number))) {
        setError('Ya existe un cheque con ese número en la chequera. Por favor, elige otro número.');
        return;
      }

      const newCheckNumber = Number(formData.check_number);
      if (newCheckNumber < checkbookInfo.min_range || newCheckNumber > checkbookInfo.max_range) {
        setError(`El número de cheque debe estar entre ${checkbookInfo.min_range} y ${checkbookInfo.max_range}.`);
        return;
      }

      await api.put(`/${checkbookId}/checks/${checkId}`, formData);
      setSuccessMessage('El cheque se actualizó exitosamente.');
      setError('');
    } catch (error) {
      console.error('Error updating check:', error);
      setError('Hubo un error al actualizar el cheque. Por favor, inténtalo nuevamente.');
    }
  };

  return (
    <div>
      <h3>Actualizar Cheque</h3>
      <form onSubmit={handleFormSubmit}>
        <div className='mb-3 mt-3'>
          <label htmlFor='check_number' className='form-label'>
            Check Number
          </label>
          <input type='number' className='form-control' id='check_number' name='check_number' onChange={handleInputChange} value={formData.check_number} />
        </div>

        {error && <div className='alert alert-danger mt-2'>{error}</div>}
        {successMessage && <div className='alert alert-success mt-2'>{successMessage}</div>}

        <button type='submit' className='btn btn-primary'>
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default CheckFormUpdate;
