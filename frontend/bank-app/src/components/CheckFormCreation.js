import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const CheckFormCreation = () => {
  const { checkbookId } = useParams();
  const [formData, setFormData] = useState({
    check_number: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [checkbookInfo, setCheckbookInfo] = useState(null);

  useEffect(() => {
    const fetchCheckbookInfo = async () => {
      try {
        const response = await api.get(`/${checkbookId}/checkbook-info`);
        setCheckbookInfo(response.data);
      } catch (error) {
        console.error('Error al obtener información del checkbook:', error);
      }
    };

    fetchCheckbookInfo();
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

    if (!formData.check_number) {
      setError('Por favor, completa el número de cheque.');
      return;
    }

    if (
      checkbookInfo &&
      (formData.check_number < checkbookInfo.min_range || formData.check_number > checkbookInfo.max_range)
    ) {
      setError('El número de cheque está fuera del rango permitido para este libro de cheques.');
      return;
    }

    try {
      await api.post(`/${checkbookId}/checks`, formData);

      setFormData({
        check_number: '',
      });

      setSuccessMessage('El cheque se creó exitosamente.');
      setError('');
    } catch (error) {
      setError('Hubo un error al procesar la solicitud. Por favor, inténtalo nuevamente.');
    }
  };

  return (
    <div>
      <h3>Crear Nuevo Cheque</h3>
      <form onSubmit={handleFormSubmit}>
        <div className='mb-3 mt-3'>
          <label htmlFor='check_number' className='form-label'>
            Número de Cheque
          </label>
          <input
            type='number'
            className='form-control'
            id='check_number'
            name='check_number'
            onChange={handleInputChange}
            value={formData.check_number}
          />
        </div>

        {error && <div className='alert alert-danger mt-2'>{error}</div>}
        {successMessage && <div className='alert alert-success mt-2'>{successMessage}</div>}

        <button type='submit' className='btn btn-primary'>
          Submit
        </button>
      </form>
    </div>
  );
};

export default CheckFormCreation;
