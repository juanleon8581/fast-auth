declare module 'winston-postgresql' {
  import TransportStream from 'winston-transport';

  interface PostgreSQLTransportOptions {
    connectionString: string;
    tableName?: string;
    level?: string;
    format?: any;
  }

  class PostgreSQLTransport extends TransportStream {
    constructor(options: PostgreSQLTransportOptions);
  }

  export = PostgreSQLTransport;
}