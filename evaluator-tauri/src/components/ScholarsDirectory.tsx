import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, UserCircle } from 'lucide-react';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import api from '../services/apiService';
import { getViewPreference, saveViewPreference } from '../services/settingsStore';
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

export const ScholarsDirectory: React.FC<ScholarsDirectoryProps> = ({ onShowModal }) => {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [filtered, setFiltered] = useState<Scholar[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [batchFilter, setBatchFilter] = useState('All Batches');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [sortBy, setSortBy] = useState('name');
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);
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
          <h1 className="text-2xl text-[#1A1A1A]">Scholars Directory</h1>
          <p className="text-sm text-[#4A5568] mt-1">Manage and monitor all active scholars.</p>
        </div>
        <div className="flex gap-1 bg-[#F0F2F0] p-1 rounded-full border border-[#E0E6E0]">
          <button 
            onClick={() => toggleView('card')} 
            className={`p-2 rounded-full transition-all ${viewType === 'card' ? 'bg-white shadow-sm text-[#1A8C3C]' : 'text-[#4A5568]'}`}
            title="Card View"
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => toggleView('list')} 
            className={`p-2 rounded-full transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-[#1A8C3C]' : 'text-[#4A5568]'}`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 shrink-0">
        <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-3 text-[#A0AEC0]" />
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
            <div className="text-center p-20 text-[#A0AEC0] bg-white rounded-2xl border border-[#E0E6E0] border-dashed">
              <Search size={40} className="mx-auto mb-2 opacity-50" />
              No scholars found matching your criteria.
            </div>
          ) : viewType === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
              {filtered.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedScholar(s)}
                  className="bg-white p-6 rounded-2xl border border-[#E0E6E0] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer"
                >
                  {s.avatar_url ? (
                    <img src={s.avatar_url} alt={`${s.first_name} ${s.last_name}`} className="w-16 h-16 rounded-full object-cover mb-4" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center font-bold text-[#1A8C3C] mb-4">
                      <UserCircle size={40} />
                    </div>
                  )}
                  <h3 className="font-semibold text-[#1A1A1A]">{s.first_name} {s.last_name}</h3>
                  <p className="text-xs text-[#4A5568] mt-1">{s.school}</p>
                  <div className="mt-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                      s.status === 'active' ? 'bg-[#E8F5ED] text-[#1A8C3C]' : 'bg-gray-100 text-gray-600'
                    }`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E0E6E0] flex-1 h-full overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-[#F7F9F7] z-10 shadow-[0_1px_0_0_#E0E6E0]">
                    <tr className="border-b border-[#E0E6E0]">
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0]">Name</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0]">School</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0]">Batch</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0]">Course</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0]">Year</th>
                      <th className="p-4 text-left text-[11px] font-bold uppercase text-[#A0AEC0]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr 
                        key={s.id} 
                        onClick={() => setSelectedScholar(s)}
                        className="border-b border-[#F0F2F0] hover:bg-[#F7F9F7] transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-medium text-[#1A1A1A]">{s.first_name} {s.last_name}</td>
                        <td className="p-4 text-[#4A5568] text-sm">{s.school}</td>
                        <td className="p-4 text-[#4A5568] text-sm">{s.batch_number}</td>
                        <td className="p-4 text-[#4A5568] text-sm">{s.course}</td>
                        <td className="p-4 text-[#4A5568] text-sm">{s.year_level}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                            s.status === 'active' ? 'bg-[#E8F5ED] text-[#1A8C3C]' : 'bg-gray-100 text-gray-600'
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
        {selectedScholar && (
          <div className="w-[400px] bg-white rounded-2xl border border-[#E0E6E0] shadow-xl flex flex-col p-8 overflow-y-auto animate-in slide-in-from-right duration-200 z-20">
            <div className="flex justify-between items-start mb-6 shrink-0">
                <h2 className="text-xl text-[#1A1A1A]">Scholar Profile</h2>
                <button onClick={() => setSelectedScholar(null)} className="text-[#A0AEC0] hover:text-[#1A1A1A] p-2">✕</button>
            </div>
            
            <div className="flex flex-col items-center mb-8">
                {selectedScholar.avatar_url ? (
                    <img src={selectedScholar.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full mb-4" />
                ) : (
                    <UserCircle size={80} className="text-[#A0AEC0] mb-4" />
                )}
                <h3 className="text-lg font-bold">{selectedScholar.first_name} {selectedScholar.last_name}</h3>
                <span className="text-xs text-[#A0AEC0] uppercase tracking-wider mt-1">{selectedScholar.status}</span>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#F0F2F0]">
                <div className="grid grid-cols-2 gap-y-4">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Status</div>
                    <div className="text-xs font-semibold text-[#1A1A1A] capitalize">{selectedScholar.status}</div>

                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">School</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.school}</div>
                    
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Batch</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.batch_number}</div>
                    
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Course</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.course}</div>
                    
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Year Level</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.year_level}</div>
                    
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Birth Date</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.date_of_birth || 'N/A'}</div>
                    
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Sex</div>
                    <div className="text-xs font-semibold text-[#1A1A1A] capitalize">{selectedScholar.sex || 'N/A'}</div>

                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Religion</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.religion || 'N/A'}</div>
                    
                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Contact</div>
                    <div className="text-xs font-semibold text-[#1A1A1A]">{selectedScholar.contact_number || 'N/A'}</div>

                    <div className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0]">Address</div>
                    <div className="text-xs font-semibold text-[#1A1A1A] col-span-2">{selectedScholar.address || 'N/A'}</div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
