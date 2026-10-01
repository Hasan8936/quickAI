import { neon } from "@neondatabase/serverless";

const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : async () => {
      throw new Error("DATABASE_URL is not configured");
    };

export default sql;
