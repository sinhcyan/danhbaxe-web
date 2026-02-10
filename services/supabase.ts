import { createClient } from '@supabase/supabase-js';
import { Carrier, Route } from '../types';

// Hardcoded initial data moved to a constant to keep the file clean
const INITIAL_CARRIERS: Carrier[] = [
  { id: 'c1', name: 'Phương Trang Nam Định', phone: '02283888999', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus1/400/300' },
  { id: 'c2', name: 'Limousine Trường Sơn', phone: '0987111222', type: 'flexible', services: ['passenger'], status: 'published', image_url: 'https://picsum.photos/seed/bus2/400/300' },
  { id: 'c3', name: 'Hải Hậu Express', phone: '0912345678', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus3/400/300' },
  { id: 'c4', name: 'Anh Tuấn VIP', phone: '0905999888', type: 'fixed', services: ['passenger', 'bike'], status: 'published', image_url: 'https://picsum.photos/seed/bus4/400/300' },
  { id: 'c5', name: 'Đức Đạt', phone: '0912000111', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus5/400/300' },
  { id: 'c6', name: 'Tấn Hưng', phone: '0913555666', type: 'fixed', services: ['passenger'], status: 'published', image_url: 'https://picsum.photos/seed/bus6/400/300' },
  { id: 'c7', name: 'Thành Công', phone: '02283666777', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus7/400/300' },
  { id: 'c8', name: 'Việt Hùng', phone: '0988777666', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus8/400/300' },
  { id: 'c9', name: 'Hòa Bình', phone: '0912888999', type: 'fixed', services: ['passenger'], status: 'published', image_url: 'https://picsum.photos/seed/bus9/400/300' },
  { id: 'c10', name: 'Khôi Nguyên', phone: '0977111333', type: 'fixed', services: ['passenger', 'goods', 'bike'], status: 'published', image_url: 'https://picsum.photos/seed/bus10/400/300' },
  { id: 'c11', name: 'Mạnh Hà', phone: '0989000222', type: 'fixed', services: ['passenger'], status: 'published', image_url: 'https://picsum.photos/seed/bus11/400/300' },
  { id: 'c12', name: 'Hoàng Long', phone: '02253999888', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus12/400/300' },
  { id: 'c13', name: 'Sao Việt Sapa', phone: '0243888999', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus13/400/300' },
  { id: 'c14', name: 'Hải Vân Sơn La', phone: '0912444555', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus14/400/300' },
  { id: 'c15', name: 'Tiến Phương', phone: '0912777888', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus15/400/300' },
  { id: 'c16', name: 'Khánh An Limousine', phone: '0912999000', type: 'flexible', services: ['passenger'], status: 'published', image_url: 'https://picsum.photos/seed/bus16/400/300' },
  { id: 'c17', name: 'Hùng Cường', phone: '0986555444', type: 'fixed', services: ['passenger', 'bike'], status: 'published', image_url: 'https://picsum.photos/seed/bus17/400/300' },
  { id: 'c18', name: 'Bảo Yến', phone: '0912111555', type: 'fixed', services: ['passenger'], status: 'published', image_url: 'https://picsum.photos/seed/bus18/400/300' },
  { id: 'c19', name: 'Anh Khôi', phone: '0988222333', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus19/400/300' },
  { id: 'c20', name: 'Phượng Hoàng', phone: '0912666999', type: 'fixed', services: ['passenger', 'goods'], status: 'published', image_url: 'https://picsum.photos/seed/bus20/400/300' }
];

const INITIAL_ROUTES: Route[] = [
  { id: 'r1', carrier_id: 'c1', origin_district: 'TP Nam Định', destination_province: 'Hà Nội', path_tags: ['BigC Nam Định', 'Phủ Lý', 'Đồng Văn', 'Thường Tín', 'Giáp Bát'], timed_stops: [{ name: 'TP Nam Định', time: '05:00' }, { name: 'Phủ Lý', time: '05:45' }, { name: 'Đồng Văn', time: '06:10' }, { name: 'Giáp Bát', time: '07:00' }], departure_times: ['05:00', '07:00', '09:00', '13:00', '15:00'], description: 'Xe 45 chỗ chất lượng cao, chạy cao tốc.', price: 100000 },
  { id: 'r2', carrier_id: 'c2', origin_district: 'Giao Thủy', destination_province: 'Hà Nội', path_tags: ['TT Ngô Đồng', 'Cầu Lạc Quần', 'Cổ Lễ', 'TP Nam Định', 'BigC Thăng Long', 'Mỹ Đình'], timed_stops: [{ name: 'TT Ngô Đồng', time: '06:00' }, { name: 'Cổ Lễ', time: '06:40' }, { name: 'TP Nam Định', time: '07:10' }, { name: 'Mỹ Đình', time: '09:00' }], departure_times: ['06:00', '08:00', '10:00', '14:00', '16:00'], description: 'Limousine 9 chỗ đưa đón tận nơi, nước uống miễn phí.', price: 150000 },
  { id: 'r3', carrier_id: 'c3', origin_district: 'Hải Hậu', destination_province: 'Hà Nội', path_tags: ['TT Yên Định', 'Chợ Cồn', 'Hải Hưng', 'Liêm Tuyền', 'Pháp Vân', 'Yên Nghĩa'], timed_stops: [{ name: 'TT Yên Định', time: '04:30' }, { name: 'Chợ Cồn', time: '04:50' }, { name: 'Liêm Tuyền', time: '06:00' }, { name: 'Yên Nghĩa', time: '07:30' }], departure_times: ['04:30', '12:30'], description: 'Xe ghế ngồi rộng rãi, nhận gửi xe máy.', price: 90000 },
  { id: 'r4', carrier_id: 'c4', origin_district: 'Nghĩa Hưng', destination_province: 'Hà Nội', path_tags: ['Liễu Đề', 'Phà Thịnh Long', 'Nghĩa Thái', 'Cao Tốc', 'Gia Lâm'], timed_stops: [{ name: 'Liễu Đề', time: '05:15' }, { name: 'Nghĩa Thái', time: '05:45' }, { name: 'Gia Lâm', time: '08:15' }], departure_times: ['05:15', '13:15'], description: 'Xe VIP giường nằm 34 phòng.', price: 120000 },
  { id: 'r5', carrier_id: 'c5', origin_district: 'Hải Hậu', destination_province: 'Hải Phòng', path_tags: ['Cầu Yên Lệnh', 'Thái Bình', 'Kiến Xương', 'Tiền Hải', 'Vĩnh Bảo', 'Cầu Rào'], timed_stops: [{ name: 'Hải Hậu', time: '06:00' }, { name: 'Thái Bình', time: '07:30' }, { name: 'Vĩnh Bảo', time: '08:15' }, { name: 'Cầu Rào', time: '09:00' }], departure_times: ['06:00', '13:00'], description: 'Chuyên tuyến Hải Hậu - Hải Phòng, xe chạy đường 10.', price: 110000 },
  { id: 'r6', carrier_id: 'c6', origin_district: 'Giao Thủy', destination_province: 'Quảng Ninh', path_tags: ['Quất Lâm', 'Thái Bình', 'Hải Phòng', 'Uông Bí', 'Hạ Long', 'Cẩm Phả', 'Móng Cái'], timed_stops: [{ name: 'Quất Lâm', time: '18:00' }, { name: 'Hải Phòng', time: '21:00' }, { name: 'Hạ Long', time: '22:30' }, { name: 'Móng Cái', time: '02:00' }], departure_times: ['18:00'], description: 'Xe giường nằm đêm, trả hàng Móng Cái sáng sớm.', price: 250000 },
  { id: 'r7', carrier_id: 'c7', origin_district: 'TP Nam Định', destination_province: 'Thái Nguyên', path_tags: ['BigC Nam Định', 'Đồng Văn', 'Vành đai 3', 'Sân bay Nội Bài', 'Sóc Sơn', 'TP Thái Nguyên'], timed_stops: [{ name: 'Nam Định', time: '06:30' }, { name: 'Nội Bài', time: '08:30' }, { name: 'Thái Nguyên', time: '09:30' }], departure_times: ['06:30', '14:00'], description: 'Xe đi đường cao tốc Hà Nội - Thái Nguyên.', price: 130000 },
  { id: 'r8', carrier_id: 'c8', origin_district: 'Ý Yên', destination_province: 'Bắc Ninh', path_tags: ['Cao Bồ', 'Ninh Bình', 'Pháp Vân', 'Cầu Thanh Trì', 'Hưng Yên', 'Từ Sơn', 'Bắc Ninh'], timed_stops: [{ name: 'Ý Yên', time: '07:00' }, { name: 'Hưng Yên', time: '08:30' }, { name: 'Bắc Ninh', time: '09:15' }], departure_times: ['07:00'], description: 'Đón khách dọc quốc lộ 10 và cao tốc.', price: 110000 },
  { id: 'r9', carrier_id: 'c9', origin_district: 'TP Nam Định', destination_province: 'Lạng Sơn', path_tags: ['Nam Định', 'Bắc Giang', 'Kép', 'Hữu Lũng', 'Chi Lăng', 'TP Lạng Sơn', 'Cửa khẩu Hữu Nghị'], timed_stops: [{ name: 'Nam Định', time: '05:00' }, { name: 'Bắc Giang', time: '07:30' }, { name: 'Lạng Sơn', time: '09:30' }], departure_times: ['05:00'], description: 'Xe chạy thẳng Lạng Sơn, nhận chuyển hàng cửa khẩu.', price: 160000 },
  { id: 'r10', carrier_id: 'c10', origin_district: 'Hải Hậu', destination_province: 'Lào Cai', path_tags: ['Hải Hậu', 'Nam Định', 'Mỹ Đình', 'Vĩnh Phúc', 'Việt Trì', 'Yên Bái', 'Lào Cai', 'Sapa'], timed_stops: [{ name: 'Hải Hậu', time: '19:00' }, { name: 'Mỹ Đình', time: '21:30' }, { name: 'Yên Bái', time: '23:30' }, { name: 'Sapa', time: '04:00' }], departure_times: ['19:00'], description: 'Cabin cung điện di động, êm ái suốt hành trình.', price: 350000 },
  { id: 'r11', carrier_id: 'c11', origin_district: 'Giao Thủy', destination_province: 'Bắc Giang', path_tags: ['Giao Thủy', 'Xuân Trường', 'Hưng Yên', 'Phố Nối', 'KCN Đình Trám', 'Bắc Giang'], timed_stops: [{ name: 'Giao Thủy', time: '06:00' }, { name: 'Phố Nối', time: '08:00' }, { name: 'Bắc Giang', time: '09:00' }], departure_times: ['06:00', '13:00'], description: 'Xe đi đường 39 Hưng Yên.', price: 120000 },
  { id: 'r12', carrier_id: 'c12', origin_district: 'TP Nam Định', destination_province: 'Sơn La', path_tags: ['Nam Định', 'Hà Đông', 'Xuân Mai', 'Hòa Bình', 'Mộc Châu', 'Sơn La'], timed_stops: [{ name: 'Nam Định', time: '18:30' }, { name: 'Hòa Bình', time: '21:00' }, { name: 'Mộc Châu', time: '00:00' }, { name: 'Sơn La', time: '03:00' }], departure_times: ['18:30'], description: 'Giường nằm chất lượng cao, chăn gối sạch sẽ.', price: 280000 },
  { id: 'r13', carrier_id: 'c13', origin_district: 'Xuân Trường', destination_province: 'Hà Nội', path_tags: ['Lạc Quần', 'Cổ Lễ', 'Nam Định', 'Pháp Vân', 'Nước Ngầm'], timed_stops: [{ name: 'Xuân Trường', time: '05:30' }, { name: 'Nam Định', time: '06:30' }, { name: 'Nước Ngầm', time: '08:00' }], departure_times: ['05:30', '08:30', '14:30'], description: 'Xe khách 29 chỗ, chạy tần suất cao.', price: 80000 },
  { id: 'r14', carrier_id: 'c14', origin_district: 'TP Nam Định', destination_province: 'Điện Biên', path_tags: ['Nam Định', 'Hà Bình', 'Sơn La', 'Tuần Giáo', 'Điện Biên Phủ'], timed_stops: [{ name: 'Nam Định', time: '16:00' }, { name: 'Sơn La', time: '00:00' }, { name: 'Điện Biên', time: '05:00' }], departure_times: ['16:00'], description: 'Chuyên tuyến Tây Bắc đường dài.', price: 380000 },
  { id: 'r15', carrier_id: 'c15', origin_district: 'Trực Ninh', destination_province: 'Hà Nội', path_tags: ['Cát Thành', 'Cổ Lễ', 'BigC Nam Định', 'Đồng Văn', 'Giáp Bát'], timed_stops: [{ name: 'Trực Ninh', time: '04:00' }, { name: 'Nam Định', time: '04:45' }, { name: 'Giáp Bát', time: '06:15' }], departure_times: ['04:00', '12:00'], description: 'Xe đi sớm, về sớm, thuận tiện công việc.', price: 90000 },
  { id: 'r16', carrier_id: 'c16', origin_district: 'TP Nam Định', destination_province: 'Ninh Bình', path_tags: ['TP Nam Định', 'Cầu Non Nước', 'TP Ninh Bình', 'Tam Điệp', 'Tràng An'], timed_stops: [{ name: 'TP Nam Định', time: '07:00' }, { name: 'TP Ninh Bình', time: '07:45' }, { name: 'Tràng An', time: '08:15' }], departure_times: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00'], description: 'Limousine liên tỉnh cự ly ngắn, đưa đón du lịch.', price: 60000 },
  { id: 'r17', carrier_id: 'c17', origin_district: 'TP Nam Định', destination_province: 'Thanh Hóa', path_tags: ['Nam Định', 'Ninh Bình', 'Bỉm Sơn', 'Hà Trung', 'TP Thanh Hóa', 'Sầm Sơn'], timed_stops: [{ name: 'Nam Định', time: '06:00' }, { name: 'Ninh Bình', time: '06:45' }, { name: 'Thanh Hóa', time: '08:15' }], departure_times: ['06:00', '10:00', '14:00'], description: 'Xe khách ghế ngả, phục vụ nước uống.', price: 80000 },
  { id: 'r18', carrier_id: 'c18', origin_district: 'Vụ Bản', destination_province: 'Hà Nội', path_tags: ['Gôi', 'Chợ Lời', 'Nam Định', 'Liêm Tuyền', 'Mỹ Đình'], timed_stops: [{ name: 'Gôi', time: '05:45' }, { name: 'Nam Định', time: '06:15' }, { name: 'Mỹ Đình', time: '08:00' }], departure_times: ['05:45', '13:45'], description: 'Xe đón khách tại thị trấn Gôi.', price: 90000 },
  { id: 'r19', carrier_id: 'c19', origin_district: 'TP Nam Định', destination_province: 'Hưng Yên', path_tags: ['Nam Định', 'Cầu Tân Đệ', 'Thái Bình', 'Triều Dương', 'TP Hưng Yên'], timed_stops: [{ name: 'Nam Định', time: '07:30' }, { name: 'Thái Bình', time: '08:15' }, { name: 'Hưng Yên', time: '09:15' }], departure_times: ['07:30', '15:30'], description: 'Tuyến xe buýt liên tỉnh chất lượng cao.', price: 70000 },
  { id: 'r20', carrier_id: 'c20', origin_district: 'Hải Hậu', destination_province: 'Quảng Ninh', path_tags: ['Hải Hậu', 'Thái Bình', 'Hải Phòng', 'Quảng Yên', 'Hạ Long', 'Cẩm Phả'], timed_stops: [{ name: 'Hải Hậu', time: '05:00' }, { name: 'Hải Phòng', time: '07:30' }, { name: 'Hạ Long', time: '08:45' }, { name: 'Cẩm Phả', time: '09:30' }], departure_times: ['05:00', '12:00'], description: 'Xe chạy ban ngày, đường bao biển Hạ Long.', price: 180000 }
];

// Determine Supabase credentials safely
const getEnvVar = (key: string) => {
    // Check both standard Vite convention and process.env fallback
    // @ts-ignore
    return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) || 
           (typeof process !== 'undefined' && process.env && process.env[key]) || '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'placeholder';
const isMockMode = supabaseUrl.includes('placeholder') || supabaseAnonKey === 'placeholder';

export const supabase = createClient(
    supabaseUrl, 
    supabaseAnonKey
);

export const supabaseService = {
  getCarriers: async (): Promise<Carrier[]> => {
    if (isMockMode) {
        console.warn('Running in Mock Mode: Using static carrier data.');
        return INITIAL_CARRIERS;
    }

    try {
        const { data, error } = await supabase.from('carriers').select('*');
        if (error) {
            console.error('Supabase Error (getCarriers):', error);
            // Fallback to mock data on error to keep app usable
            return INITIAL_CARRIERS;
        }
        return data as Carrier[];
    } catch (e) {
        console.error('Unexpected error:', e);
        return INITIAL_CARRIERS;
    }
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
    console.log("Saving carrier:", carrier);
    if (isMockMode) {
        // In a real mock implementation, we might push to the arrays, 
        // but for a stateless demo, logging is sufficient.
        alert("Mock Mode: Carrier saved locally (console log).");
        return;
    }
    const { error } = await supabase.from('carriers').insert([carrier]);
    if (error) console.error('Error saving carrier:', error);
  },

  saveRoute: async (route: Route) => {
    console.log("Saving route:", route);
    if (isMockMode) {
        alert("Mock Mode: Route saved locally (console log).");
        return;
    }
    const { carrier, ...routeData } = route;
    const { error } = await supabase.from('routes').insert([routeData]);
    if (error) console.error('Error saving route:', error);
  },

  updateRouteStatus: async (routeId: string, status: 'published' | 'pending') => {
    console.log("Updating status:", routeId, status);
    if (isMockMode) return;

    // Use a transaction-like approach or just simple updates
    // Ideally we update the Route, but here status is on the Carrier according to previous logic.
    // Let's assume we are updating the carrier associated with the route.
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
    // For search, we always pull all routes and filter in memory for this scale.
    // In a real production large-scale app, we would use Supabase .textSearch() or .ilike()
    const allRoutes = await supabaseService.getRoutes();

    return allRoutes.filter(r => {
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