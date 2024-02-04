import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const FormCreation = () => {
  const [formData, setFormData] = useState({
    bank_name: '',
    min_range: '',
    max_range: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!formData.bank_name || !formData.min_range || !formData.max_range) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (parseInt(formData.max_range) <= parseInt(formData.min_range)) {
      setError('El rango máximo debe ser mayor que el rango mínimo.');
      return;
    }

    if (parseInt(formData.min_range) < 0 || parseInt(formData.max_range) < 0) {
      setError('Los valores no pueden ser negativos.');
      return;
    }

    if (parseInt(formData.max_range) - parseInt(formData.min_range) > 30) {
      setError('La diferencia entre el rango máximo y mínimo no puede exceder 30.');
      return;
    }

    try {
      await api.post('/checkbooks/', formData);

      setFormData({
        bank_name: '',
        min_range: '',
        max_range: '',
      });

      setSuccessMessage('La chequera se creó exitosamente.');
      setError('');
    } catch (error) {
      setError('Hubo un error al enviar el formulario. Por favor, inténtalo nuevamente.');
    }
  };

  return (
    <div>
      <div className='mb-4'>
        <Link to='/checkbooks' className='btn btn-light'>
          Ver Chequeras
        </Link>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className='mb-3 mt-3'>
          <label htmlFor='bank_name' className='form-label'>
            Bank Name
          </label>
          <input type='text' className='form-control' id='bank_name' name='bank_name' onChange={handleInputChange} value={formData.bank_name}/>
        </div>

        <div className='mb-3'>
          <label htmlFor='min_range' className='form-label'>
            Minimum range
          </label>
          <input type='number' className='form-control' id='min_range' name='min_range' onChange={handleInputChange} value={formData.min_range}/>
        </div>

        <div className='mb-3'>
          <label htmlFor='max_range' className='form-label'>
            Maximum range
          </label>
          <input type='number' className='form-control' id='max_range' name='max_range' onChange={handleInputChange} value={formData.max_range}/>
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

export default FormCreation;