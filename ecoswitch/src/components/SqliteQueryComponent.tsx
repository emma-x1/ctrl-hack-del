"use client";
import React, { useState, useEffect } from 'react';

const loadSqlJs = async () => {
  const initSqlJs = await import('sql.js/dist/sql-wasm.js');
  return initSqlJs.default({
    locateFile: () => '/sql-wasm.wasm', // Location of sql-wasm.wasm file
  });
};

const SqliteQueryComponent = ({ companyName, onIntensityUpdate, onGradeUpdate }) => {
  const [db, setDb] = useState(null);

  // Load the database only once when the component mounts
  useEffect(() => {
    const loadDatabase = async () => {
      if (typeof window === 'undefined') return;

      try {
        const SQL = await loadSqlJs();
        const response = await fetch('/envData.sqlite'); // Ensure this file is in the public directory
        const buffer = await response.arrayBuffer();
        const dbInstance = new SQL.Database(new Uint8Array(buffer));
        setDb(dbInstance);
      } catch (error) {
        console.error("Failed to load the SQLite database:", error);
      }
    };

    loadDatabase();
  }, []);

  // Fetch data whenever `companyName` changes and `db` is loaded
  useEffect(() => {
    if (!db || !companyName) return;

    const fetchEnvironmentalIntensity = () => {
      const query = `
        SELECT "Total Environmental Intensity (Revenue)"
        FROM company_data
        WHERE "Company Name" LIKE ? 
        LIMIT 1
      `;

      const results = db.exec(query, [`%${companyName}%`]);
      if (results.length > 0 && results[0].values.length > 0) {
        const newIntensity = parseFloat(results[0].values[0][0]) * 100;
        onIntensityUpdate(newIntensity); // Send intensity to the parent

        let newGrade = "B";
        if (newIntensity <= -50) {
          newGrade = "F";
        } else if (newIntensity > -50 && newIntensity <= -5) {
          newGrade = "D";
        } else if (newIntensity > -5 && newIntensity <= 5) {
          newGrade = "C";
        } else if (newIntensity > 5 && newIntensity <= 50) {
          newGrade = "B";
        } else {
          newGrade = "A";
        }
        
        onGradeUpdate(newGrade); // Send grade to the parent
      } else {
        onIntensityUpdate(null); // Notify parent if intensity is not found
        onGradeUpdate("B"); // Notify parent if grade is not available
      }
    };

    fetchEnvironmentalIntensity();
  }, [companyName, db]);

  return null; // Render nothing in the child component
};

export default SqliteQueryComponent;
