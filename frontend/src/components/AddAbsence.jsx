import React, { useState } from 'react';
import { getToken } from '../utils/auth.js';
import { API_BASE_URL } from '../config.js';

function AddAbsence() {
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        reason: 'Urlop_zwykły',
    });

    const [errors, setErrors] = useState([]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
          const token = getToken();
          if (!token) {
              window.location.href = '/login';
              return;
          }
  
          const response = await fetch(`${API_BASE_URL}api/absences/store`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(formData),
          });
  
          if (response.ok) {
              const data = await response.json();
              const successMessage = encodeURIComponent(data.successMessage);
              window.location.href = `/calendar?successMessage=${successMessage}`;
          } else {
              const data = await response.json();
              setErrors(data.errors || [data.detail || 'Wystąpił błąd podczas zapisywania nieobecności.']);
          }
      } catch (error) {
          console.error('Error:', error);
          setErrors(['Wystąpił błąd podczas zapisywania nieobecności.']);
      }
  };

    return (
        <div className="container">
            <h1>Dodaj nieobecność</h1>

            {errors.length > 0 && (
                <div className="alert alert-danger">
                    <ul>
                        {errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="start_date">Data początkowa</label>
                    <input
                        type="date"
                        name="start_date"
                        id="start_date"
                        className="form-control"
                        required
                        value={formData.start_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="end_date">Data końcowa</label>
                    <input
                        type="date"
                        name="end_date"
                        id="end_date"
                        className="form-control"
                        required
                        value={formData.end_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group mt-3">
                    <label htmlFor="reason">Powód</label>
                    <select
                        name="reason"
                        id="reason"
                        className="form-control"
                        required
                        value={formData.reason}
                        onChange={handleChange}
                    >
                        <option value="Urlop_zwykły">Urlop zwykły</option>
                        <option value="Urlop_bezpłatny">Urlop bezpłatny</option>
                        <option value="Nadwyżka">Nadwyżka</option>
                        <option value="Praca_zdalna">Praca zdalna</option>
                        <option value="Delegacja">Delegacja</option>
                        <option value="Choroba">Choroba</option>
                        <option value="Inny">Inny</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary mt-4">Zapisz</button>
            </form>
        </div>
    );
}

export default AddAbsence;
