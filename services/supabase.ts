import { createClient } from '@supabase/supabase-js';
import { Carrier, Route } from '../types';
import { INITIAL_CARRIERS, INITIAL_ROUTES } from '../utils/constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
const isMockMode = supabaseUrl.includes('placeholder') || supabaseAnonKey === 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
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

  getRoutes: async (): Promise<Route[]> => {
    if (isMockMode) {
      return INITIAL_ROUTES.map(r => ({
        ...r,
        carrier: INITIAL_CARRIERS.find(c => c.id === r.carrier_id)
      }));
    }

    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*, carrier:carriers(*)');

      if (error) {
        console.error('Supabase Error (getRoutes):', error);
        return INITIAL_ROUTES.map(r => ({
          ...r,
          carrier: INITIAL_CARRIERS.find(c => c.id === r.carrier_id)
        }));
      }
      
      return data.map((item: any) => ({
        ...item,
        carrier: item.carrier
      })) as Route[];
    } catch (e) {
      console.error('Unexpected error:', e);
      return INITIAL_ROUTES.map(r => ({ ...r, carrier: INITIAL_CARRIERS.find(c => c.id === r.carrier_id) }));
    }
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
  },

  saveRoute: async (route: Route) => {
    if (isMockMode) {
       console.log("Mock save route:", route);
       return;
    }
    const { carrier, ...routeData } = route;
    const { error } = await supabase.from('routes').insert([routeData]);
    if (error) throw error;
  },

  updateRoute: async (routeId: string, routeUpdates: Partial<Route>) => {
    if (isMockMode) {
       console.log("Mock update route:", routeId, routeUpdates);
       return;
    }
    const { carrier, ...data } = routeUpdates;
    const { error } = await supabase.from('routes').update(data).eq('id', routeId);
    if (error) throw error;
  },

  updateRouteStatus: async (routeId: string, status: 'published' | 'pending') => {
    if (isMockMode) return;
    const { data: route } = await supabase.from('routes').select('carrier_id').eq('id', routeId).single();
    if (route) {
      const { error } = await supabase
        .from('carriers')
        .update({ status })
        .eq('id', route.carrier_id);
      if (error) console.error('Error updating status:', error);
    }
  },

  searchRoutes: async (origin: string, dest: string, startTime?: string, endTime?: string): Promise<Route[]> => {
    const allRoutes = await supabaseService.getRoutes();

    return allRoutes.filter(r => {
      if (r.carrier?.status !== 'published') return false;

      const qOrigin = origin?.trim().toLowerCase();
      const qDest = dest?.trim().toLowerCase();

      const hasPoint = (query: string) => {
           if (!query) return true;
           const target = query;
           return (
               r.origin_district.toLowerCase().includes(target) ||
               r.destination_province.toLowerCase().includes(target) ||
               r.path_tags?.some((t: string) => t.toLowerCase().includes(target)) ||
               r.timed_stops?.some((s: any) => s.name.toLowerCase().includes(target))
           );
      };

      if (qOrigin && !hasPoint(qOrigin)) return false;
      if (qDest && !hasPoint(qDest)) return false;

      if (startTime && endTime && qOrigin) {
        let departureTimeAtOrigin = '';
        const stop = r.timed_stops?.find((s: any) => s.name.toLowerCase().includes(qOrigin));
        
        if (stop && stop.time && stop.time !== '--:--') {
            departureTimeAtOrigin = stop.time;
        } else if (r.origin_district.toLowerCase().includes(qOrigin) && r.departure_times?.length > 0) {
            departureTimeAtOrigin = r.departure_times[0];
        }

        if (!departureTimeAtOrigin) return false; 
        if (departureTimeAtOrigin < startTime || departureTimeAtOrigin > endTime) return false;
      }
      return true;
    });
  },

  seedData: async () => {
      if (isMockMode) return { success: true, message: 'Đã nạp dữ liệu mẫu (Mock mode)!' };
      
      try {
          const { count } = await supabase.from('carriers').select('*', { count: 'exact', head: true });
          if (count && count > 0) return { success: false, message: 'Dữ liệu đã tồn tại, không cần nạp lại.' };

          const { error: err1 } = await supabase.from('carriers').insert(INITIAL_CARRIERS);
          if (err1) return { success: false, message: 'Lỗi nạp carriers: ' + err1.message };

          const routesToInsert = INITIAL_ROUTES.map(({ carrier, ...rest }) => rest);
          const { error: err2 } = await supabase.from('routes').insert(routesToInsert);
          if (err2) return { success: false, message: 'Lỗi nạp routes: ' + err2.message };

          return { success: true, message: 'Đã khôi phục dữ liệu mẫu thành công!' };
      } catch (e: any) {
          return { success: false, message: 'Lỗi không xác định: ' + e.message };
      }
  }
};