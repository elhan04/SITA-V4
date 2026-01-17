
import { GOOGLE_SCRIPT_URL } from './constants';

type ActionType = 'addUser' | 'addStudent' | 'addRecord' | 'addExam' | 'markAttendance' | 'updateUser' | 'deleteData';

// Helper: Penunggu waktu (Delay)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Fetch dengan Retry Logic (Exponential Backoff + Jitter)
// Ini sangat penting agar 20 user tidak gagal bersamaan, melainkan mencoba ulang secara bertahap.
async function fetchWithRetry(url: string, options: RequestInit, retries = 5, backoff = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Jika mode 'no-cors' (untuk POST), statusnya selalu 0 (opaque), jadi kita anggap sukses jika tidak throw error.
    // Jika mode 'cors' (untuk GET), kita cek status ok.
    if (options.method === 'GET' && !response.ok) {
        // Jika status 429 (Too Many Requests) atau 5xx (Server Error), lempar error agar di-retry
        if (response.status === 429 || response.status >= 500) {
            throw new Error(`Server busy: ${response.status}`);
        }
    }
    
    return response;
  } catch (err) {
    if (retries > 0) {
       // Tambahkan Jitter (waktu acak 0-500ms) agar semua user tidak retry di detik yang persis sama
       const jitter = Math.random() * 500;
       const delay = backoff + jitter;
       
       console.warn(`Request failed, retrying in ${Math.round(delay)}ms... (${retries} retries left)`);
       await wait(delay);
       
       // Coba lagi dengan waktu tunggu 2x lipat (Exponential Backoff)
       return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

export const api = {
  // Fungsi mengirim data (POST)
  async send(action: ActionType, data: any) {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn("GOOGLE_SCRIPT_URL is empty. Data saved locally only.");
        return;
    }

    try {
      const payload = JSON.stringify({ action, data });
      
      // Tambahkan sedikit delay acak awal (50-300ms) sebelum mengirim request
      // Ini mencegah "Thundering Herd" (semua user klik tombol save di milidetik yang sama)
      await wait(Math.random() * 300);

      // Gunakan fetchWithRetry
      await fetchWithRetry(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk GAS Web App
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      console.log(`Data sent to cloud: ${action}`);
    } catch (error) {
      console.error(`Sync failed for ${action} after multiple retries:`, error);
      // UX Note: Karena ini "Optimistic UI" (data sudah tampil di layar user), 
      // kegagalan sync background ini jarang disadari user. 
      // Idealnya ada indikator "Sync Error", tapi untuk V.1 ini sudah cukup robust.
    }
  },

  // Fungsi mengambil semua data (GET)
  async load() {
    if (!GOOGLE_SCRIPT_URL) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Naikkan timeout ke 20 detik

    try {
      // Gunakan fetchWithRetry untuk Load Data juga
      const response = await fetchWithRetry(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Data loaded from Cloud successfully");
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Failed to load cloud data:", error);
      return null;
    }
  }
};
