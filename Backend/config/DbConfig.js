const { createClient } = require("@supabase/supabase-js");

console.log(
  "env data are ",
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log("supabase connected");

module.exports = supabase;
