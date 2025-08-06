// Mock for Supabase services during testing
export const supabase = {
    auth: {
        signInWithOtp: jest.fn(),
        verifyOtp: jest.fn(),
        setSession: jest.fn(),
        getSession: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
};

export default supabase;
