import { 
  useGetPreferencesQuery, 
  useUpdateUserMutation 
} from "@/store/api/usersApi";
// Wait, I didn't add a setPreference mutation to usersApi yet. 
// I only added it to the controller.

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";

// Let's add it to usersApi or a new preferencesApi. 
// Actually I'll just add it to usersApi.
