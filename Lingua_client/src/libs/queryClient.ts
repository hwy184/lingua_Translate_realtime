import { QueryClient } from "@tanstack/react-query";

const queryClientOptions = {
    defaultOptions: {
        queries: {
            // Dữ liệu sẽ được coi là "cũ" (stale) sau 5 phút
            // Nó sẽ không tự động fetch lại trong 5 phút này
            staleTime: 1000 * 60 * 5, // 5 phút

            // Dữ liệu sẽ bị xóa khỏi cache sau 10 phút không hoạt động
            // cacheTime: 1000 * 60 * 10, // 10 phút (tên mới là gcTime)
            gcTime: 1000 * 60 * 10, // (gcTime là tên mới của cacheTime)

            // Chỉ tự động thử lại (retry) 1 lần nếu query thất bại
            retry: 1,

            // Tắt tính năng tự động fetch lại khi cửa sổ trình duyệt được focus
            refetchOnWindowFocus: false,
        },
    },
};

export const queryClient = new QueryClient(queryClientOptions);
