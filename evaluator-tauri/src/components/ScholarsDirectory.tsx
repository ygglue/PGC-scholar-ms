import React, { useState, useEffect } from 'react';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import api from '../services/apiService';

interface Scholar {
  id: string;
  first_name: string;
  last_name: string;
  batch_number: string;
  school: string;
  course: string;
  year_level: string;
  status: 'active' | 'inactive' | 'graduate';
  student_type: 'regular' | 'irregular';
  avatar_url?: string;
}

interface ScholarsDirectoryProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const ScholarsDirectory: React.FC<ScholarsDirectoryProps> = ({ onShowModal }) => {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [filtered, setFiltered] = useState<Scholar[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [viewType, setViewType] = useState<'card' | 'list'>('card');

  useEffect(() => {
    loadScholars();
  }, []);

  const loadScholars = async () => {
    const CACHE_KEY = "scholars/list";
    const cached = CacheService.get<Scholar[]>(CACHE_KEY);

    if (cached) {
      setScholars(cached);
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
      }
    }
  };

  useEffect(() => {
    let result = scholars.filter(s => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFiltered(result);
  }, [scholars, search, statusFilter]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-serif text-[#1A1A1A]">Scholars Directory</h1>
          <p className="text-sm text-[#4A5568] mt-1">Manage and monitor all active scholars.</p>
        </div>
        <div className="flex gap-1 bg-[#F0F2F0] p-1 rounded-full border border-[#E0E6E0]">
          <button 
            onClick={() => setViewType('card')} 
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${viewType === 'card' ? 'bg-white shadow-sm text-[#1A8C3C]' : 'text-[#4A5568]'}`}
          >
            Card View
          </button>
          <button 
            onClick={() => setViewType('list')} 
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-[#1A8C3C]' : 'text-[#4A5568]'}`}
          >
            List View
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 shrink-0">
        <input 
          placeholder="Search by name..." 
          className="input-field w-full max-w-sm" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select className="input-field max-w-[200px]" onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduate">Graduate</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
            {filtered.map(s => (
              <div key={s.id} className="bg-white p-6 rounded-2xl border border-[#E0E6E0] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8F5ED] flex items-center justify-center font-bold text-[#1A8C3C] mb-4">
                  {s.first_name[0]}{s.last_name[0]}
                </div>
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
          <div className="bg-white rounded-2xl border border-[#E0E6E0] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F7F9F7]">
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
                  <tr key={s.id} className="border-b border-[#F0F2F0] hover:bg-[#F7F9F7] transition-colors">
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
        )}
      </div>
    </div>
  );
};
