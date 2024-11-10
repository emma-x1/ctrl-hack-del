import { NextRequest, NextResponse } from 'next/server';

// Use a dynamic import to load sql.js only at runtime
const loadSqlJs = async () => {
  const sqlModule = await import('sql.js');
  return sqlModule.default({
    locateFile: () => '/sql-wasm.wasm', // Make sure sql-wasm.wasm is in the public directory
  });
};

// Load the SQLite database from an external source or pre-loaded memory buffer
const loadDatabaseFromURL = async (SQL) => {
  const response = await fetch('https://github.com/emma-x1/ctrl-hack-del/raw/refs/heads/main/ecoswitch/public/mydatabase.sqlite');
  const buffer = await response.arrayBuffer();
  return new SQL.Database(new Uint8Array(buffer));
};

export async function POST(req: NextRequest) {
  try {
    const { companyName } = await req.json();

    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'Company name must be provided as a string', answer: '' },
        { status: 400 }
      );
    }

    // Load sql.js dynamically and the database
    const SQL = await loadSqlJs();
    const db = await loadDatabaseFromURL(SQL);

    const query = `
      SELECT "Total Environmental Intensity (Revenue)"
      FROM mytable
      WHERE "Company Name" LIKE ? 
      LIMIT 1
    `;
    const results = db.exec(query, [`%${companyName}%`]);

    const intensity = results.length > 0 && results[0].values.length > 0
      ? results[0].values[0][0]
      : 'Company not found';

    db.close();

    return NextResponse.json(
      {
        success: true,
        answer: intensity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error querying SQLite database:", error);
    return NextResponse.json(
      {
        success: false,
        failedReason: (error as Error).message,
        answer: '',
      },
      { status: 500 }
    );
  }
}
