import React, { useState } from 'react';
import '../styles/login.css';
import { API_BASE_URL } from '../config.js';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePassword = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage('Rejestracja zakończona sukcesem. Możesz się teraz zalogować.');
                setTimeout(() => window.location.href = '/login', 2000);
            } else {
                const data = await response.json();
                setMessage(`Błąd: ${data.error || 'Nieznany błąd'}`);
            }
        } catch (error) {
            setMessage(`Błąd: ${error.message}`);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box register-box">
                <h1>Zarejestruj się</h1>
                
                {message && <p className="error-message">{message}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nazwa użytkownika</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Adres e-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Hasło</label>
                        <div className="password-input">
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={togglePassword}
                            >
                                <img
                                    src="/eye.svg"
                                    alt="Pokaż/ukryj hasło"
                                    style={{ opacity: passwordVisible ? '1' : '0.7' }}
                                />
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button">
                        Zarejestruj się
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;
