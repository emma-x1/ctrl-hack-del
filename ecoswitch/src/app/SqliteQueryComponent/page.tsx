"use client";
import React, { useState, useEffect } from 'react';

// Dynamically import the browser-only `sql-wasm.js`
const loadSqlJs = async () => {
  const initSqlJs = await import('sql.js/dist/sql-wasm.js');
  return initSqlJs.default({
    locateFile: () => '/sql-wasm.wasm', // Location of sql-wasm.wasm file
  });
};

const SqliteQueryComponent = () => {
  const [db, setDb] = useState<any>(null);
  const [companyName, setCompanyName] = useState('');
  const [intensity, setIntensity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDatabase = async () => {
      if (typeof window === 'undefined') return; // Only run on client side

      try {
        const SQL = await loadSqlJs(); // Use the dynamically loaded `sql-wasm.js`
        const response = await fetch('/mydatabase.sqlite'); // Ensure this file is in public directory
        const buffer = await response.arrayBuffer();
        const db = new SQL.Database(new Uint8Array(buffer));
        setDb(db);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load the SQLite database:", error);
      }
    };

    loadDatabase();
  }, []);

  const fetchEnvironmentalIntensity = () => {
    if (!db || !companyName) return;

    const query = `
      SELECT "Total Environmental Intensity (Revenue)"
      FROM mytable
      WHERE "Company Name" LIKE ? 
      LIMIT 1
    `;

    const results = db.exec(query, [`%${companyName}%`]);
    if (results.length > 0 && results[0].values.length > 0) {
      setIntensity(results[0].values[0][0] as string);
    } else {
      setIntensity('Company not found');
    }
  };

  return (
    <div>
      <h1>Environmental Intensity Lookup</h1>
      {loading ? (
        <p>Loading database...</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <button onClick={fetchEnvironmentalIntensity}>Search</button>
          {intensity && (
            <div>
              <h2>Result</h2>
              <p>{intensity}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SqliteQueryComponent;
