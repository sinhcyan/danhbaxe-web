import { routeService } from './route.service';
import { carrierService } from './carrier.service';
import { seedService } from './seed.service';
import { supabase } from './supabaseClient';

export const supabaseService = {
  ...routeService,
  ...carrierService,
  ...seedService,
};

export { supabase };