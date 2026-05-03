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

export const ScholarsDirectory: React.FC = () => {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif">Scholars Directory</h1>
        <div className="flex gap-2 bg-[#F7F9F7] p-1 rounded-full border border-[#E0E6E0]">
          <button onClick={() => setViewType('list')} className={`px-4 py-2 rounded-full ${viewType === 'list' ? 'bg-white' : ''}`}>List</button>
          <button onClick={() => setViewType('card')} className={`px-4 py-2 rounded-full ${viewType === 'card' ? 'bg-white' : ''}`}>Card</button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          placeholder="Search name..." 
          className="input-field max-w-xs" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select className="input-field max-w-[150px]" onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduate">Graduate</option>
        </select>
      </div>

      {viewType === 'card' ? (
        <div className="grid grid-cols-4 gap-6">
          {filtered.map(s => (
            <div key={s.id} className="card flex flex-col items-center text-center p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center font-bold mb-4">
                {s.first_name[0]}{s.last_name[0]}
              </div>
              <h3 className="font-semibold">{s.first_name} {s.last_name}</h3>
              <p className="text-sm text-gray-500">{s.school}</p>
              <span className={`mt-2 px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                s.status === 'active' ? 'bg-[#E8F5ED] text-[#1A8C3C]' : 'bg-gray-100'
              }`}>{s.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full bg-white rounded-lg border border-[#E0E6E0]">
          <thead>
            <tr className="border-b border-[#E0E6E0]">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">School</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-[#E0E6E0]">
                <td className="p-4">{s.first_name} {s.last_name}</td>
                <td className="p-4">{s.school}</td>
                <td className="p-4">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
