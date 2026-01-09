import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import stream from "npm:getstream"

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
    // Get and validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const getstreamApiKey = Deno.env.get('GETSTREAM_API_KEY')
    const getstreamApiSecret = Deno.env.get('GETSTREAM_API_SECRET')
    const getstreamAppId = Deno.env.get('GETSTREAM_APP_ID')

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasGetStreamKey: !!getstreamApiKey,
      hasGetStreamSecret: !!getstreamApiSecret,
      hasGetStreamAppId: !!getstreamAppId
    })

    if (!supabaseUrl || !supabaseServiceKey || !getstreamApiKey || !getstreamApiSecret || !getstreamAppId) {
      throw new Error('Missing required environment variables')
    }

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

    // Create GetStream client and generate user token
    const client = stream.connect(getstreamApiKey, getstreamApiSecret, getstreamAppId)
    
    // Prepare user data
    const getstreamUserData = {
      first_name: userData?.first_name || user.user_metadata?.first_name || "User",
      last_name: userData?.last_name || user.user_metadata?.last_name || "",
      avatar: userData?.avatar_url || user.user_metadata?.avatar_url || "https://via.placeholder.com/150",
      username: userData?.username || user.email?.split('@')[0] || user.id
    }

    // Try to create the user first, then update if they already exist
    try {
      await client.user(user.id).create(getstreamUserData)
      console.log('GetStream user created:', user.id)
    } catch (createError: unknown) {
      // If user already exists, update instead
      const errorMessage = createError instanceof Error ? createError.message : '';
      const errorCode = (createError as any)?.code;
      if (errorMessage.includes('already exists') || errorCode === 4) {
        await client.user(user.id).update(getstreamUserData)
        console.log('GetStream user updated:', user.id)
      } else {
        throw createError // Re-throw if it's a different error
      }
    }
    
    const userToken = client.createUserToken(user.id)

    const response = {
      token: userToken,
      apiKey: getstreamApiKey,
      appId: getstreamAppId,
      userId: user.id
    }

    console.log('GetStream token generated successfully for user:', user.id)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Error generating GetStream token:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate GetStream token',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})