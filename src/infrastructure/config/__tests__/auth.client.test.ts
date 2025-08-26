import { AuthClient, AuthClientType } from '../auth.client';
import { createClient } from '@supabase/supabase-js';
import envs from '@/config/envs';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Mock envs
jest.mock('@/config/envs', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key'
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('AuthClient', () => {
  let authClient: AuthClient;
  let mockSupabaseClient: any;

  beforeEach(() => {
    authClient = new AuthClient();
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signIn: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn()
      }
    };
    mockCreateClient.mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create AuthClient instance', () => {
      expect(authClient).toBeInstanceOf(AuthClient);
    });

    it('should have create method', () => {
      expect(typeof authClient.create).toBe('function');
    });
  });

  describe('create method', () => {
    it('should call createClient with correct parameters', () => {
      authClient.create();

      expect(mockCreateClient).toHaveBeenCalledWith(
        envs.SUPABASE_URL,
        envs.SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      );
    });

    it('should return Supabase client instance', () => {
      const result = authClient.create();

      expect(result).toBe(mockSupabaseClient);
      expect(result).toHaveProperty('auth');
    });

    it('should create new client instance on each call', () => {
      const client1 = authClient.create();
      const client2 = authClient.create();

      expect(mockCreateClient).toHaveBeenCalledTimes(2);
      expect(client1).toBe(mockSupabaseClient);
      expect(client2).toBe(mockSupabaseClient);
    });

    it('should configure auth options correctly', () => {
      authClient.create();

      const callArgs = mockCreateClient.mock.calls[0];
      expect(callArgs).toBeDefined();
      const authConfig = callArgs?.[2]?.auth;

      expect(authConfig).toEqual({
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      });
    });

    it('should use environment variables for URL and key', () => {
      authClient.create();

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.any(Object)
      );
    });
  });

  describe('type compatibility', () => {
    it('should return AuthClientType compatible instance', () => {
      const client: AuthClientType = authClient.create();
      
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should have auth property with expected methods', () => {
      const client = authClient.create();
      
      expect(client.auth).toBeDefined();
      expect(typeof client.auth.signUp).toBe('function');
      expect(typeof client.auth.signInWithPassword).toBe('function');
      expect(typeof client.auth.signOut).toBe('function');
    });
  });

  describe('configuration validation', () => {
    it('should disable auto refresh token', () => {
      authClient.create();
      
      const config = mockCreateClient.mock.calls[0]?.[2];
      expect(config?.auth?.autoRefreshToken).toBe(false);
    });

    it('should disable session persistence', () => {
      authClient.create();
      
      const config = mockCreateClient.mock.calls[0]?.[2];
      expect(config?.auth?.persistSession).toBe(false);
    });

    it('should disable session detection in URL', () => {
      authClient.create();
      
      const config = mockCreateClient.mock.calls[0]?.[2];
      expect(config?.auth?.detectSessionInUrl).toBe(false);
    });
  });
});