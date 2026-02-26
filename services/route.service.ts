import { supabase, isMockMode } from './supabaseClient';
import { Route } from '../types';
import { INITIAL_ROUTES, INITIAL_CARRIERS } from '../utils/constants';

let cachedRoutes: Route[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// We need getRoutes as a top-level function so searchRoutes can call it 
// or searchRoutes can use routeService.getRoutes()
export const routeService = {
    getRoutes: async (): Promise<Route[]> => {
        if (isMockMode) {
            return INITIAL_ROUTES.map(r => ({
                ...r,
                carrier: INITIAL_CARRIERS.find(c => c.id === r.carrier_id)
            }));
        }

        if (cachedRoutes && Date.now() - lastFetchTime < CACHE_DURATION) {
            return cachedRoutes;
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

            const parsedData = data.map((item: any) => ({
                ...item,
                carrier: item.carrier
            })) as Route[];

            cachedRoutes = parsedData;
            lastFetchTime = Date.now();
            return parsedData;
        } catch (e) {
            console.error('Unexpected error:', e);
            return INITIAL_ROUTES.map(r => ({ ...r, carrier: INITIAL_CARRIERS.find(c => c.id === r.carrier_id) }));
        }
    },

    saveRoute: async (route: Route) => {
        if (isMockMode) {
            console.log("Mock save route:", route);
            return;
        }
        cachedRoutes = null; // Invalidate cache
        const { carrier, ...routeData } = route;
        const { error } = await supabase.from('routes').insert([routeData]);
        if (error) throw error;
    },

    updateRoute: async (routeId: string, routeUpdates: Partial<Route>) => {
        if (isMockMode) {
            console.log("Mock update route:", routeId, routeUpdates);
            return;
        }
        cachedRoutes = null; // Invalidate cache
        const { carrier, ...data } = routeUpdates;
        const { error } = await supabase.from('routes').update(data).eq('id', routeId);
        if (error) throw error;
    },

    updateRouteStatus: async (routeId: string, status: 'published' | 'pending') => {
        if (isMockMode) return;
        cachedRoutes = null; // Invalidate cache
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
        const allRoutes = await routeService.getRoutes();

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
    }
};
