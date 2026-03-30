This file gives any agent working on Applyer distinct instructions about the developer's preferences and instructions.

The purpose of Applyer is to allow a user to upload a resume, search for jobs, and apply to them automatically.

In order to upload a resume, the user must be logged in.  Login is handled by Supabase Auth with Google sign-in.  The user's email is used to identify them.  The user's email is stored in Supabase Auth.  The user's email is also stored in Supabase Storage as the name of the folder where their resumes are stored.  The user's email is also stored in Supabase Storage as the name of the folder where their cover letters are stored.  The user's email is also stored in Supabase Storage as the name of the folder where their networking contacts are stored. 

Job searching runs on the Himalayas API. Use more APIs to job scrub by using a generalized scrubbing engine. Create a function that 