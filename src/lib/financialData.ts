import { supabase } from '@/integrations/supabase/client';

export interface UserFinancialData {
  id?: string;
  user_id: string;
  account_number?: string | null;
  institution_number?: string | null;
  transit_number?: string | null;
  tax_id?: string | null;
  government_id_image?: string | null;
  void_cheque?: string | null;
  payment_method_ids?: string[] | null;
  payout_method_id?: string | null;
}

/**
 * Secure utility functions for managing user financial data
 * This data is stored separately from user profiles for enhanced security
 */

export const getFinancialData = async (userId: string): Promise<UserFinancialData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_financial_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
};

export const createFinancialData = async (financialData: Omit<UserFinancialData, 'id'>): Promise<UserFinancialData> => {
  try {
    const { data, error } = await supabase
      .from('user_financial_data')
      .insert(financialData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating financial data:', error);
    throw error;
  }
};

export const updateFinancialData = async (
  userId: string,
  updates: Partial<Omit<UserFinancialData, 'id' | 'user_id'>>
): Promise<UserFinancialData> => {
  try {
    const { data, error } = await supabase
      .from('user_financial_data')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating financial data:', error);
    throw error;
  }
};

export const deleteFinancialData = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_financial_data')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting financial data:', error);
    throw error;
  }
};

// Helper function to check if user has financial data set up
export const hasFinancialData = async (userId: string): Promise<boolean> => {
  try {
    const data = await getFinancialData(userId);
    return data !== null;
  } catch (error) {
    return false;
  }
};