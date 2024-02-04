import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const UpdateCheckBookForm = () => {
  const { checkbookId } = useParams();
  const [formData, setFormData] = useState({
    bank_name: '',
    min_range: '',
    max_range: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCheckbookData = async () => {
      try {
        const response = await api.get(`/checkbooks/${checkbookId}`);
        const { bank_name, min_range, max_range } = response.data;
        setFormData({ bank_name, min_range, max_range });
      } catch (error) {
        console.error('Error fetching checkbook data:', error);
      }
    };

    fetchCheckbookData();
  }, [checkbookId]);

  const handleInputChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!formData.bank_name.trim()) {
      setErrorMessage('Por favor, completa todos los campos.');
      setSuccessMessage('');
      return;
    }

    try {
      await api.put(`/checkbooks/${checkbookId}`, formData);
      setSuccessMessage('Chequera actualizada exitosamente.');
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating checkbook:', error);
      setErrorMessage('Hubo un error al actualizar la chequera. Por favor, inténtalo nuevamente.');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div className='mb-3 mt-3'>
          <label htmlFor='bank_name' className='form-label'>
            Nombre del banco
          </label>
          <input type='text' className='form-control' id='bank_name' name='bank_name' onChange={handleInputChange} value={formData.bank_name}/>
        </div>

        {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
        {successMessage && <div className='alert alert-success'>{successMessage}</div>}

        <button type='submit' className='btn btn-primary'>
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default UpdateCheckBookForm;

