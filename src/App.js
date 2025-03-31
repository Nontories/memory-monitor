import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [memoryData, setMemoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMemoryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://memory-checking.onrender.com/api/memory-usage');
      setMemoryData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryData();

    const intervalId = setInterval(() => {
      fetchMemoryData();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const chartData = memoryData ? [
    {
      name: 'Memory Usage',
      current: parseInt(memoryData.memory_usage) / (1024 * 1024),
      peak: parseInt(memoryData.peak_memory_usage) / (1024 * 1024),
      limit: parseInt(memoryData.memory_limit.replace(/[^0-9]/g, ''))
    }
  ] : [];

  const calculateUsagePercentage = () => {
    if (!memoryData) return 0;
    const limit = parseInt(memoryData.memory_limit.replace(/[^0-9]/g, '')) * 1024 * 1024;
    return Math.round((memoryData.memory_usage / limit) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage < 50) return '#4caf50'; // Green - good
    if (percentage < 80) return '#ff9800'; // Orange - warning
    return '#f44336'; // Red - danger
  };

  const usagePercentage = calculateUsagePercentage();
  const statusColor = getStatusColor(usagePercentage);

  return (
    <div className="app-container">
      <header>
        <h1>Memory Monitor</h1>
        <div className="controls">
          <div className="refresh-control">
            <label>Update after: </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>
          <button onClick={fetchMemoryData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      {!error && memoryData && (
        <div className="dashboard">
          <div className="cards-container">
            <div className="card">
              <h3>Current Usage</h3>
              <p className="value">{memoryData.memory_usage_mb}</p>
            </div>
            <div className="card">
              <h3>Peak Usage</h3>
              <p className="value">{memoryData.peak_memory_usage_mb}</p>
            </div>
            <div className="card">
              <h3>Limit</h3>
              <p className="value">{memoryData.memory_limit}</p>
            </div>
          </div>

          <div className="usage-meter">
            <h3>Usage Ratio</h3>
            <div className="meter-container">
              <div
                className="meter-fill"
                style={{
                  width: `${usagePercentage}%`,
                  backgroundColor: statusColor
                }}
              ></div>
            </div>
            <p className="meter-value">{usagePercentage}%</p>
          </div>

          <div className="chart-container">
            <h3>Memory Comparison (MB)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" name="Current" fill="#2196f3" />
                <Bar dataKey="peak" name="Peak" fill="#9c27b0" />
                <Bar dataKey="limit" name="Limit" fill="#ff5722" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;