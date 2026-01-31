import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bacigbaxjirodgibqhfk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhY2lnYmF4amlyb2RnaWJxaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODU0NTEsImV4cCI6MjA4NTI2MTQ1MX0.-ySZl-6lJVgmHdh3I2W5BOO3JxAQ1SeRHhxBGSXrNM4';

export const supabase = createClient(supabaseUrl, supabaseKey);
