import { NextRequest, NextResponse } from 'next/server';
import initSqlJs from 'sql.js';

// Load the WebAssembly file via HTTP, making it compatible with environments without `fs`.
const loadSqlJs = async () => {
  const SQL = await initSqlJs({
    locateFile: () => '/sql-wasm.wasm', // Ensure sql-wasm.wasm is accessible from the public directory
  });
  return SQL;
};

// Load the SQLite database file via HTTP fetch, avoiding `fs`.
const loadDatabase = async (SQL) => {
  // Fetch the database file from the public directory
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/mydatabase.sqlite`);
  const buffer = await response.arrayBuffer();

  // Open the database using the buffer in memory
  return new SQL.Database(new Uint8Array(buffer));
};

export async function POST(req: NextRequest) {
  try {
    const { companyName } = await req.json();

    // Validate the input
    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json(
        { success: false, failedReason: 'Company name must be provided as a string', answer: '' },
        { status: 400 }
      );
    }

    // Initialize sql.js and load the database
    const SQL = await loadSqlJs();
    const db = await loadDatabase(SQL);

    // Define and execute the query
    const query = `
      SELECT "Total Environmental Intensity (Revenue)"
      FROM mytable
      WHERE "Company Name" LIKE ? 
      LIMIT 1
    `;
    const results = db.exec(query, [`%${companyName}%`]);

    // Format the result
    const intensity = results.length > 0 && results[0].values.length > 0
      ? results[0].values[0][0]
      : 'Company not found';

    // Close the database
    db.close();

    // Return the response
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
