import React, { useEffect, useState } from 'react';
import { getToken } from '../utils/auth.js';
import '../styles/dropdown.css';
import { API_BASE_URL } from '../config.js';

const WeeklySummary = () => {
    const [weekOffset, setWeekOffset] = useState(0);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [dailySummary, setDailySummary] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [weeklyTotal, setWeeklyTotal] = useState('00:00:00');
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');

    const fetchWeeklySummary = async (userId = null) => {
        try {
            setLoading(true);
            const token = getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const params = new URLSearchParams({
                weekOffset: weekOffset,
            });

            const effectiveUserId = userId !== null ? userId : selectedUserId;
            if (effectiveUserId !== null) {
                params.append('user_id', effectiveUserId);
            }

            const response = await fetch(`${API_BASE_URL}api/time/weekly-summary?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                window.location.href = '/login';
            } else if (response.ok) {
                const data = await response.json();
                setDailySummary(data.dailySummary || {});
                setWeeklyTotal(data.weeklyTotal || '00:00:00');
                setUsers(data.users || []);
                
                if (selectedUserId === null && userId === null) {
                    const apiSelectedUserId = data.selectedUserId || null;
                    setSelectedUserId(apiSelectedUserId);
                    if (apiSelectedUserId && data.users) {
                        const selectedUser = data.users.find(user => user.id === apiSelectedUserId);
                        if (selectedUser) {
                            setSelectedUserName(selectedUser.name);
                        }
                    }
                }
                
                setErrorMessage('');
            } else if (response.status === 400 || response.status === 404) {
                const errorData = await response.json();
                setErrorMessage(errorData.detail || 'Wystąpił błąd podczas pobierania danych.');
            } else {
                throw new Error('Nie udało się pobrać danych podsumowania.');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.message || 'Wystąpił błąd podczas pobierania danych.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeeklySummary();
    }, [weekOffset]);

    const handleUserSelect = (user) => {
        setSelectedUserId(user.id);
        setSelectedUserName(user.name);
        setIsDropdownOpen(false);
        fetchWeeklySummary(user.id);
    };

    const handleWeekChange = (offsetChange) => {
        setWeekOffset((prevOffset) => prevOffset + offsetChange);
    };

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="container mt-4">
                {!loading && (
                    <>
                        <div className="mb-4">
                            <div className="nav-controls">
                                <div className="custom-dropdown">
                                    <div 
                                        className={`dropdown-input-box ${isDropdownOpen ? 'open' : ''}`}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        {selectedUserName || 'Select User'}
                                    </div>
                                    <div className={`dropdown-list ${isDropdownOpen ? 'open' : ''}`}>
                                        <div className="dropdown-search-box">
                                            <input
                                                type="search"
                                                className="dropdown-search"
                                                placeholder="Wpisz nazwę"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={`dropdown-option ${selectedUserId === user.id ? 'selected' : ''}`}
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                {user.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleWeekChange(-1)}
                                >
                                    ← Poprzedni tydzień
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleWeekChange(1)}
                                >
                                    Następny tydzień →
                                </button>
                            </div>
                        </div>

                        <h1>Podsumowanie tygodnia</h1>
                        {errorMessage ? (
                            <div className="alert alert-danger">{errorMessage}</div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Dzień</th>
                                        <th>Całkowity czas</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(dailySummary).map((date) => (
                                        <tr key={date}>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {formatDate(date)}
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {dailySummary[date].time}
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                {dailySummary[date].is_active ? (
                                                    <span
                                                        style={{
                                                            fontSize: '32px',
                                                            verticalAlign: 'middle',
                                                            color: 'yellow',
                                                        }}
                                                    >
                                                        &#9679;
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            fontSize: '32px',
                                                            verticalAlign: 'middle',
                                                        }}
                                                    >
                                                        &#9679;
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{ verticalAlign: 'middle' }}>Suma tygodniowa</th>
                                        <th style={{ verticalAlign: 'middle' }}>{weeklyTotal}</th>
                                        <th></th>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default WeeklySummary;
