// sqljs.d.ts
declare module 'sql.js' {
    export interface InitSqlJsStatic {
      Database: any;
      new (data?: Uint8Array): Database;
    }
  
    export interface Database {
      exec: (sql: string, params?: any[]) => any;
      close: () => void;
    }
  
    const initSqlJs: (config?: { locateFile: (file: string) => string }) => Promise<InitSqlJsStatic>;
    export default initSqlJs;
  }
  