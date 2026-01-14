import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import stream from "https://esm.sh/getstream@8.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const getstreamApiKey = Deno.env.get('GETSTREAM_API_KEY')!
    const getstreamApiSecret = Deno.env.get('GETSTREAM_API_SECRET')!
    const getstreamAppId = Deno.env.get('GETSTREAM_APP_ID')!

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token or user not found')
    }

    // Get user data from users table
    const { data: userData, error: dbUserError } = await supabase
      .from('users')
      .select('username, first_name, last_name, avatar_url, email')
      .eq('id', user.id)
      .single()

    if (dbUserError || !userData) {
      console.warn('User not found in users table, using auth metadata')
    }

    // Create GetStream client and sync user
    const client = stream.connect(getstreamApiKey, getstreamApiSecret, getstreamAppId)
    
    // Update the user in GetStream with user data
    await client.user(user.id).update({
      first_name: userData?.first_name || user.user_metadata?.first_name || "User",
      last_name: userData?.last_name || user.user_metadata?.last_name || "",
      avatar: userData?.avatar_url || user.user_metadata?.avatar_url || "https://via.placeholder.com/150",
      username: userData?.username || user.email?.split('@')[0] || user.id
    })

    console.log('GetStream user synced successfully for user:', user.id)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'User synced to GetStream successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Error syncing GetStream user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync GetStream user',
        message: errorMessage
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})