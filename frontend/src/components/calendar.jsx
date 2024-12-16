import React, { useEffect, useState } from 'react';
import { getToken } from '../utils/auth.js';
import '../styles/dropdown.css';
import { API_BASE_URL } from '../config.js';

const Calendar = () => {
    const [monthOffset, setMonthOffset] = useState(0);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [calendar, setCalendar] = useState({});
    const [formattedCurrentMonth, setFormattedCurrentMonth] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');

    const fetchCalendarData = async (userId = null) => {
        try {
            setLoading(true);
            const token = getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const params = new URLSearchParams({
                monthOffset: monthOffset,
            });

            const effectiveUserId = userId !== null ? userId : selectedUserId;
            if (effectiveUserId !== null) {
                params.append('user_id', effectiveUserId);
            }

            const response = await fetch(`${API_BASE_URL}api/calendar?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                window.location.href = '/login';
            } else if (response.ok) {
                const data = await response.json();
                setCalendar(data.calendar || {});
                setFormattedCurrentMonth(data.formattedCurrentMonth || '');
                setUsers(data.users || []);
                setErrorMessage('');

                if (selectedUserId === null && userId === null) {
                    if (data.selectedUserId) {
                        setSelectedUserId(data.selectedUserId);
                        const selectedUser = data.users.find(user => user.id === data.selectedUserId);
                        if (selectedUser) {
                            setSelectedUserName(selectedUser.name);
                        }
                    } else if (data.users && data.users.length > 0) {
                        setSelectedUserId(data.users[0].id);
                        setSelectedUserName(data.users[0].name);
                    }
                }

                const urlParams = new URLSearchParams(window.location.search);
                const success = urlParams.get('successMessage');
                if (success) {
                    setSuccessMessage(decodeURIComponent(success));
                    urlParams.delete('successMessage');
                    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                    window.history.replaceState({}, '', newUrl);
                }
            } else if (response.status === 400 || response.status === 404) {
                const errorData = await response.json();
                setErrorMessage(errorData.detail || 'Wystąpił błąd podczas pobierania danych.');
            } else {
                throw new Error('Nie udało się pobrać danych kalendarza.');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.message || 'Wystąpił błąd podczas pobierania danych.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, [monthOffset]);

    const handleUserSelect = (user) => {
        setSelectedUserId(user.id);
        setSelectedUserName(user.name);
        setIsDropdownOpen(false);
        fetchCalendarData(user.id);
    };

    const handleMonthChange = (offsetChange) => {
        setMonthOffset((prevOffset) => prevOffset + offsetChange);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h1>Kalendarz nieobecności - {formattedCurrentMonth}</h1>

            {successMessage && (
                <div className="alert alert-success">
                    {successMessage}
                </div>
            )}

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
                        onClick={() => handleMonthChange(-1)}
                    >
                        ← Poprzedni miesiąc
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleMonthChange(1)}
                    >
                        Następny miesiąc →
                    </button>
                    <a href="/create" className="btn btn-info">
                        Dodaj nieobecność
                    </a>
                </div>
            </div>

            {errorMessage ? (
                <div className="alert alert-danger">
                    {errorMessage}
                </div>
            ) : (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th style={{ width: '33.33%' }}>Dzień miesiąca</th>
                            <th style={{ width: '33.33%' }}>Dzień tygodnia</th>
                            <th style={{ width: '33.33%' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(calendar).map((day) => (
                            <tr
                                key={day}
                                style={calendar[day].is_today ? { border: '3px solid' } : {}}
                            >
                                <td style={{ width: '33.33%' }}>{day}</td>
                                <td style={{ width: '33.33%' }}>{calendar[day].day_of_week}</td>
                                <td style={{ width: '33.33%' }}>{calendar[day].status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Calendar;
