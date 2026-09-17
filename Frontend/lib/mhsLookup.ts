/**
 * Utility untuk lookup data mahasiswa dari API resmi SIPENAMAS Universitas Multi Data Palembang
 * URL: https://apps2.mdp.ac.id/sipenamas/lppm/lookupmhs
 */

export interface MhsLookupResult {
  npm: string;
  name: string;
  email: string;
  angkatan: number;
}

interface RawMhsItem {
  id: string; // NPM, e.g. "2428240153"
  value: string; // "Ahmad Rizki Hartawan (2428240153)"
}

let cachedMhsList: RawMhsItem[] = [];
let isFetched = false;
let fetchPromise: Promise<RawMhsItem[]> | null = null;

/**
 * Fetch list mahasiswa lengkap dengan caching in-memory
 */
export async function getMhsList(): Promise<RawMhsItem[]> {
  if (isFetched) return cachedMhsList;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch("https://apps2.mdp.ac.id/sipenamas/lppm/lookupmhs");
      const data = await res.json();
      if (data && Array.isArray(data.message)) {
        cachedMhsList = data.message;
        isFetched = true;
        return cachedMhsList;
      }
      return [];
    } catch (err) {
      console.error("Gagal memuat API lookup mahasiswa:", err);
      return [];
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Parse raw data item menjadi data terstruktur (name, email, angkatan)
 */
export function formatMhsData(raw: RawMhsItem): MhsLookupResult {
  const npm = raw.id.trim();
  // Bersihkan format "Nama (NPM)" -> "Nama"
  const name = raw.value.replace(/\s*\(\d+\)$/, "").trim();
  // Buat format email resmi: ahmadrizkihartawan_2428240153@mhs.mdp.ac.id
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const email = `${cleanName}_${npm}@mhs.mdp.ac.id`;
  // Ambil tahun angkatan dari 2 digit pertama NPM (misal 24 -> 2024)
  const parsedAngkatan = parseInt(npm.substring(0, 2), 10);
  const angkatan = !isNaN(parsedAngkatan) && parsedAngkatan >= 10 && parsedAngkatan <= 99
    ? 2000 + parsedAngkatan
    : new Date().getFullYear();

  return {
    npm,
    name,
    email,
    angkatan,
  };
}

/**
 * Cari data mahasiswa berdasarkan NPM (exact match atau prefix match)
 */
export async function lookupMhsByNpm(npmInput: string): Promise<MhsLookupResult | null> {
  const cleanNpm = npmInput.trim();
  if (!cleanNpm || cleanNpm.length < 5) return null;

  const list = await getMhsList();
  const found = list.find((item) => item.id === cleanNpm);
  if (!found) return null;

  return formatMhsData(found);
}

/**
 * Cari data mahasiswa berdasarkan kata kunci nama atau NPM
 */
export async function searchMhs(query: string, limit = 10): Promise<MhsLookupResult[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const list = await getMhsList();
  const matched = list
    .filter((item) => item.id.includes(q) || item.value.toLowerCase().includes(q))
    .slice(0, limit);

  return matched.map(formatMhsData);
}
