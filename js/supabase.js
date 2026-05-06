const SUPABASE_URL = 'https://zbfkeptjmnlnbvhxpygb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PkWcqsD0x0hRQn-Do_6qMg_T6FmJvs4';

// Initialize Supabase client
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.BoosterXSupabase = (() => {
  const sb = window.supabaseClient;

  // -- Auth --
  async function signUp(email, password, name) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { name } // mapped to raw_user_meta_data->>'name'
      }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function resetPasswordForEmail(email) {
    const { data, error } = await sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await sb.auth.signOut();
  }

  async function getSession() {
    const { data: { session }, error } = await sb.auth.getSession();
    if (error) throw error;
    return session;
  }

  // -- Database Wrappers --
  async function getProfile(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  }

  async function getClients() {
    const { data, error } = await sb.from('clients').select('*');
    if (error) throw error;
    return data;
  }

  async function getAccounts() {
    const { data, error } = await sb.from('accounts').select('*');
    if (error) throw error;
    return data;
  }

  async function getPosts() {
    const { data, error } = await sb.from('posts').select('*');
    if (error) throw error;
    return data;
  }

  async function addPost(postData) {
    const { data, error } = await sb.from('posts').insert([postData]).select();
    if (error) throw error;
    return data[0];
  }

  async function addAccount(accountData) {
    const { data, error } = await sb.from('accounts').insert([accountData]).select();
    if (error) throw error;
    return data[0];
  }

  async function addClient(clientData) {
    const { data, error } = await sb.from('clients').insert([clientData]).select();
    if (error) throw error;
    return data[0];
  }

  async function updateProfileTier(userId, tier) {
    const { data, error } = await sb.from('profiles').update({ tier }).eq('id', userId);
    if (error) throw error;
    return data;
  }

  async function uploadPostMedia(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await sb.storage.from('post_media').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = sb.storage.from('post_media').getPublicUrl(filePath);
    return data.publicUrl;
  }

  return {
    signUp,
    signIn,
    resetPasswordForEmail,
    signOut,
    getSession,
    getProfile,
    getClients,
    getAccounts,
    getPosts,
    addAccount,
    addPost,
    addClient,
    updateProfileTier,
    uploadPostMedia
  };
})();
