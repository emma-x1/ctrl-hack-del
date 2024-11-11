'use client';
import React, { useEffect, useState } from 'react';

const loadSqlJs = async () => {
  const initSqlJs = await import('sql.js/dist/sql-wasm.js');
  return initSqlJs.default({
    locateFile: () => '/sql-wasm.wasm',
  });
};

const SqliteQueryComponent = ({ companyName, onGradeUpdate }) => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDatabase = async () => {
      if (typeof window === 'undefined') return;

      try {
        const SQL = await loadSqlJs();
        const response = await fetch('/envData.sqlite'); // Ensure this file is in the public directory
        const buffer = await response.arrayBuffer();
        console.log(`resppnsSQLlite: ${response}`)
        const dbInstance = new SQL.Database(new Uint8Array(buffer));
        console.log(`dbinstance: ${dbInstance}`)
        setDb(dbInstance);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load the SQLite database:", error);
        setLoading(false);
      }
    };

    loadDatabase();
  }, []);

  useEffect(() => {
    const fetchEnvironmentalIntensity = () => {
      if (!db || !companyName) return;

      const query = `
        SELECT "Total Environmental Intensity (Revenue)"
        FROM company_data
        WHERE "Company Name" LIKE ? 
        LIMIT 1
      `;

      const results = db.exec(query, [`%${companyName}%`]);
      if (results.length > 0 && results[0].values.length > 0) {
        const intensity = parseFloat(results[0].values[0][0]) * 100;
        let grade;
        console.log(`results ${results}`)
        console.log(`grade: ${grade}`)
        if (intensity <= -50) {
          grade = "F";
        } else if (intensity > -50 && intensity <= -5) {
          grade = "D";
        } else if (intensity > -5 && intensity <= 5) {
          grade = "C";
        } else if (intensity > 5 && intensity <= 50) {
          grade = "B";
        } else {
          grade = "A";
        }

        onGradeUpdate(grade); // Pass grade back to parent
      } else {
        onGradeUpdate("B"); // Default grade if not found
      }
    };

    fetchEnvironmentalIntensity();
  }, [db, companyName, onGradeUpdate]);

  return (
    <div>
      {loading && <p>Loading database...</p>}
    </div>
  );
};

export default SqliteQueryComponent;
