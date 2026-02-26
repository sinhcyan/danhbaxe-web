import { supabase, isMockMode } from './supabaseClient';
import { Carrier } from '../types';
import { INITIAL_CARRIERS } from '../utils/constants';

export const carrierService = {
    getCarriers: async (): Promise<Carrier[]> => {
        if (isMockMode) {
            console.warn('Running in Mock Mode: Using static carrier data.');
            return INITIAL_CARRIERS;
        }
        const { data, error } = await supabase.from('carriers').select('*');
        if (error) {
            console.error('Supabase Error (getCarriers):', error);
            return INITIAL_CARRIERS;
        }
        return data as Carrier[];
    },

    saveCarrier: async (carrier: Carrier) => {
        if (isMockMode) {
            console.log("Mock save carrier:", carrier);
            return;
        }
        const { error } = await supabase.from('carriers').insert([carrier]);
        if (error) throw error;
    },

    updateCarrier: async (carrierId: string, updates: Partial<Carrier>) => {
        if (isMockMode) {
            console.log("Mock update carrier:", carrierId, updates);
            return;
        }
        const { error } = await supabase.from('carriers').update(updates).eq('id', carrierId);
        if (error) throw error;
    }
};
