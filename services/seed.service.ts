import { supabase, isMockMode } from './supabaseClient';
import { INITIAL_ROUTES, INITIAL_CARRIERS } from '../utils/constants';

export const seedService = {
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
