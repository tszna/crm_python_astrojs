import React, { useEffect, useState } from 'react';
import { getToken } from '../utils/auth.js';
import { API_BASE_URL } from '../config.js';

const Profile = () => {
    const [currentDate, setCurrentDate] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState('-');
    const [endTime, setEndTime] = useState('-');
    const [currentTime, setCurrentTime] = useState('00:00:00');

    const [initialCountTime, setInitialCountTime] = useState(0);
    const [initialTimestamp, setInitialTimestamp] = useState(Date.now());

    const formatTime = (seconds) => {
        seconds = parseInt(seconds, 10) || 0;

        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let secs = Math.floor(seconds % 60);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        secs = secs < 10 ? '0' + secs : secs;

        return `${hours}:${minutes}:${secs}`;
    };

    const timeStringToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
    };

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        setCurrentDate(formattedDate);
    }, []);

    const fetchCurrentSession = async () => {
        try {
            const token = getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/time/getCurrentSession`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            } else if (response.status === 204) {
                setIsActive(false);
                setCurrentTime('00:00:00');
                setStartTime('-');
                setEndTime('-');
                setInitialCountTime(0);
                setInitialTimestamp(Date.now());
            } else if (response.ok) {
                const data = await response.json();
                setIsActive(data.is_active);
                setStartTime(data.start_time || '-');
                setEndTime(data.end_time || (data.is_active ? 'czas jest w trakcie liczenia' : '-'));
                setInitialCountTime(parseInt(data.count_time, 10) || 0);
                setInitialTimestamp(Date.now());
                setCurrentTime(formatTime(parseInt(data.count_time, 10) || 0));
            } else {
                throw new Error('Nieoczekiwany kod odpowiedzi: ' + response.status);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas ładowania danych.');
        } finally {
            setInitialLoading(false);
        }
    };

    const startSession = async () => {
        try {
            setActionLoading(true);
            const token = getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/time/startSession`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            } else if (response.ok) {
                const data = await response.json();

                setIsActive(true);
                setStartTime(data.start_time || '-');
                setEndTime('czas jest w trakcie liczenia');
                setInitialCountTime(parseInt(data.count_time, 10) || 0);
                setInitialTimestamp(Date.now());
                setCurrentTime(formatTime(parseInt(data.count_time, 10) || 0));
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Nieoczekiwany kod odpowiedzi: ' + response.status);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Wystąpił błąd podczas rozpoczynania sesji.');
        } finally {
            setActionLoading(false);
        }
    };

    const stopSession = async () => {
        try {
            setActionLoading(true);
            const token = getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_BASE_URL}api/time/stopSession`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            } else if (response.ok) {
                const data = await response.json();

                setIsActive(false);
                setEndTime(data.end_time || '-');
                setInitialCountTime(timeStringToSeconds(data.elapsed_time) || initialCountTime);
                setCurrentTime(data.elapsed_time || formatTime(initialCountTime));
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Nieoczekiwany kod odpowiedzi: ' + response.status);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Wystąpił błąd podczas zatrzymywania sesji.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        let interval = null;

        if (actionLoading || initialLoading) return;

        if (isActive) {
            interval = setInterval(() => {
                const elapsedSeconds = initialCountTime + Math.floor((Date.now() - initialTimestamp) / 1000);
                setCurrentTime(formatTime(elapsedSeconds));
            }, 1000);
        } else {
            setCurrentTime(formatTime(initialCountTime));
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, actionLoading, initialLoading, initialCountTime, initialTimestamp]);

    useEffect(() => {
        fetchCurrentSession();
    }, []);

    return (
        <div className="container mt-4">
            <h1>Dzisiaj jest: {currentDate}</h1>
            {actionLoading && <span id="loading-btn" className="loader"></span>}
            {!initialLoading && !actionLoading && (
                <div id="content_container">
                    <button
                        id="start-btn"
                        className="btn btn-success"
                        onClick={startSession}
                        disabled={isActive}
                    >
                        Start
                    </button>
                    <button
                        id="stop-btn"
                        className="btn btn-danger"
                        onClick={stopSession}
                        disabled={!isActive}
                    >
                        Stop
                    </button>
                    <div id="session-info" style={{ marginTop: '20px' }}>
                        <p>Godzina startu: <span id="start-time">{startTime}</span></p>
                        <p>Godzina zakończenia: <span id="end-time">{endTime}</span></p>
                        <p>Czas sesji: <span id="current-time">{currentTime}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
