import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, UserCircle } from 'lucide-react';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import api from '../services/apiService';
import { getViewPreference, saveViewPreference } from '../services/settingsStore';
import { useTabs } from '../contexts/TabContext';
import { ModalProps } from './shared/Modal';

interface Scholar {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  batch_number: string;
  school: string;
  course: string;
  year_level: string;
  status: 'active' | 'inactive' | 'graduate';
  student_type: 'regular' | 'irregular';
  avatar_url?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  sex?: string;
  civil_status?: string;
  religion?: string;
  address?: string;
  contact_number?: string;
  date_enrolled?: string;
}

interface ScholarsDirectoryProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const ScholarsDirectory: React.FC<ScholarsDirectoryProps> = ({ onShowModal: _onShowModal }) => {
  const { openTab } = useTabs();
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [filtered, setFiltered] = useState<Scholar[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [sortBy, setSortBy] = useState('name');
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState(true);

  // Derive unique options
  const batches = Array.from(new Set(scholars.map(s => s.batch_number))).sort();
  const courses = Array.from(new Set(scholars.map(s => s.course))).sort();

  useEffect(() => {
    const init = async () => {
      const pref = await getViewPreference();
      if (pref) setViewType(pref as 'card' | 'list');
      await loadScholars();
    };
    init();
  }, []);

  const toggleView = async (type: 'card' | 'list') => {
    setViewType(type);
    await saveViewPreference(type);
  };

  const loadScholars = async () => {
    setLoading(true);
    const CACHE_KEY = "scholars/list";
    const cached = CacheService.get<Scholar[]>(CACHE_KEY);

    if (cached) {
      setScholars(cached);
      setLoading(false);
      return;
    }

    const isOnline = await NetworkStatus.checkApiConnection();
    if (isOnline) {
      try {
        const res = await api.get("/scholars/");
        const data = res.data;
        setScholars(data);
        CacheService.set(CACHE_KEY, data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let result = scholars.filter(s => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || s.status === statusFilter;
      const matchesBatch = batchFilter === 'All Batches' || s.batch_number === batchFilter;
      const matchesCourse = courseFilter === 'All Courses' || s.course === courseFilter;
      return matchesSearch && matchesStatus && matchesBatch && matchesCourse;
    });

    result.sort((a, b) => {
        if (sortBy === 'name') return (a.first_name + a.last_name).localeCompare(b.first_name + b.last_name);
        if (sortBy === 'batch') return a.batch_number.localeCompare(b.batch_number);
        if (sortBy === 'course') return a.course.localeCompare(b.course);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
    });

    setFiltered(result);
  }, [scholars, search, statusFilter, batchFilter, courseFilter, sortBy]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl text-[#1A1A1A] dark:text-dark-text">Scholars Directory</h1>
          <p className="text-sm text-[#4A5568] dark:text-dark-text-sec mt-1">Manage and monitor all active scholars.</p>
        </div>
        <div className="flex gap-1 bg-[#F0F2F0] dark:bg-dark-surface p-1 rounded-full border border-[#E0E6E0] dark:border-dark-border">
          <button 
            onClick={() => toggleView('card')} 
            className={`p-2 rounded-full transition-all ${viewType === 'card' ? 'bg-white dark:bg-dark-card shadow-sm text-[#1A8C3C]' : 'text-[#4A5568] dark:text-dark-text-sec'}`}
            title="Card View"
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => toggleView('list')} 
            className={`p-2 rounded-full transition-all ${viewType === 'list' ? 'bg-white dark:bg-dark-card shadow-sm text-[#1A8C3C]' : 'text-[#4A5568] dark:text-dark-text-sec'}`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 shrink-0">
        <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-3 text-[#A0AEC0] dark:text-dark-text-muted" />
            <input 
              placeholder="Search by name..." 
              className="input-field w-full pl-10" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
        </div>
        <select className="input-field max-w-[150px]" onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option>All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduate">Graduate</option>
        </select>
        <select className="input-field max-w-[150px]" onChange={(e) => setBatchFilter(e.target.value)} value={batchFilter}>
          <option>All Batches</option>
          {batches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="input-field max-w-[200px]" onChange={(e) => setCourseFilter(e.target.value)} value={courseFilter}>
          <option>All Courses</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field max-w-[150px]" onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="name">Sort by Name</option>
          <option value="batch">Sort by Batch</option>
          <option value="course">Sort by Course</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <div className="flex-1 flex flex-row gap-8 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center p-20 text-[#A0AEC0]">Loading scholars...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-20 text-[#A0AEC0] dark:text-dark-text-muted bg-white dark:bg-dark-card rounded-2xl border border-[#E0E6E0] dark:border-dark-border border-dashed">
              <Search size={40} className="mx-auto mb-2 opacity-50" />
              No scholars found matching your criteria.
            </div>
          ) : viewType === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
              {filtered.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => openTab('scholar', `${s.first_name} ${s.last_name}`, { scholarId: s.id })}
                  className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
                >
                  {s.avatar_url ? (
                    <img src={s.avatar_url} alt={`${s.first_name} ${s.last_name}`} className="w-16 h-16 rounded-full object-cover mb-4" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#E8F5ED] dark:bg-dark-green-bg flex items-center justify-center font-bold text-[#1A8C3C] dark:text-dark-green mb-4">
                      <UserCircle size={40} />
                    </div>
                  )}
                  <h3 className="font-semibold text-[#1A1A1A] dark:text-dark-text">{s.first_name} {s.last_name}</h3>
                  <p className="text-xs text-[#4A5568] dark:text-dark-text-sec mt-1">{s.school}</p>
                  <div className="mt-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                      s.status === 'active' ? 'bg-[#E8F5ED] text-[#1A8C3C]' : 'bg-gray-100 text-gray-600'
                    }`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-[#E0E6E0] dark:border-dark-border flex-1 h-full overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-[#F7F9F7] dark:bg-dark-surface z-10 shadow-[0_1px_0_0_#E0E6E0] dark:shadow-[0_1px_0_0_#374151]">
                    <tr className="border-b border-[#E0E6E0] dark:border-dark-border">
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">Name</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">School</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">Batch</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">Course</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">Year</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr 
                        key={s.id} 
                        onClick={() => openTab('scholar', `${s.first_name} ${s.last_name}`, { scholarId: s.id })}
                        className="border-b border-[#F0F2F0] dark:border-dark-border hover:bg-[#F7F9F7] dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-medium text-[#1A1A1A] dark:text-dark-text">{s.first_name} {s.last_name}</td>
                        <td className="p-4 text-[#4A5568] dark:text-dark-text-sec text-sm">{s.school}</td>
                        <td className="p-4 text-[#4A5568] dark:text-dark-text-sec text-sm">{s.batch_number}</td>
                        <td className="p-4 text-[#4A5568] dark:text-dark-text-sec text-sm">{s.course}</td>
                        <td className="p-4 text-[#4A5568] dark:text-dark-text-sec text-sm">{s.year_level}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
s.status === 'active' ? 'bg-[#E8F5ED] dark:bg-dark-green-badge text-[#1A8C3C] dark:text-dark-green' : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-sec'
                          }`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarsDirectory;
