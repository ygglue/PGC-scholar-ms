import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle, ClipboardList, User, FileText, FolderPlus, Megaphone, Activity } from 'lucide-react';
import api from '../services/apiService';
import { CacheService } from '../services/cacheService';
import { NetworkStatus } from '../services/networkStatus';
import { ModalProps } from './shared/Modal';

interface DashboardProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
  onNavigate: (view: 'submissions' | 'directory' | 'bins' | 'announcements' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onShowModal, onNavigate }) => {
  const [stats, setStats] = useState({
    totalScholars: 0,
    activeScholars: 0,
    pendingSubmissions: 0,
    pendingProfiles: 0,
    pendingGrades: 0,
    pendingDocs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);
const loadStats = async () => {
  const SCHOLARS_CACHE = "scholars/list";
  const PENDING_CACHE = "pending_changes/list";

  const cachedScholars = CacheService.get<any[]>(SCHOLARS_CACHE);
  const cachedPending = CacheService.get<any[]>(PENDING_CACHE);

  if (cachedScholars || cachedPending) {
    setStats({
      totalScholars: (cachedScholars || []).length,
      activeScholars: (cachedScholars || []).filter(s => s.status === 'active').length,
      pendingSubmissions: (cachedPending || []).length,
      pendingProfiles: (cachedPending || []).filter(p => p.change_type === 'profile').length,
      pendingGrades: (cachedPending || []).filter(p => p.change_type === 'grades').length,
      pendingDocs: (cachedPending || []).filter(p => p.change_type === 'documents').length
    });
    setLoading(false);
    // Return if we have cache, no need to fetch if we prioritize fast display
    return;
  }

  setLoading(true);
  const isOnline = await NetworkStatus.checkApiConnection();
  if (isOnline) {
    try {
      const [scholarsRes, pendingRes] = await Promise.all([
        api.get("/scholars/"),
        api.get("/pending-changes/")
      ]);

      CacheService.set(SCHOLARS_CACHE, scholarsRes.data);
      CacheService.set(PENDING_CACHE, pendingRes.data);

      setStats({
        totalScholars: scholarsRes.data.length,
        activeScholars: scholarsRes.data.filter((s: any) => s.status === 'active').length,
        pendingSubmissions: pendingRes.data.length,
        pendingProfiles: pendingRes.data.filter((p: any) => p.change_type === 'profile').length,
        pendingGrades: pendingRes.data.filter((p: any) => p.change_type === 'grades').length,
        pendingDocs: pendingRes.data.filter((p: any) => p.change_type === 'documents').length
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }
};  const StatCard = ({ title, value, icon, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-[#E0E6E0] shadow-sm hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[#F7F9F7] rounded-xl text-[#1A8C3C]">{icon}</div>
        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#F7F9F7] text-[#A0AEC0] group-hover:text-[#1A8C3C] group-hover:bg-[#E8F5ED] transition-colors">View</span>
      </div>
      <h3 className="text-sm font-medium text-[#4A5568]">{title}</h3>
      <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{value}</p>
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-10">
        <h1 className="text-2xl text-[#1A1A1A]">Evaluator Dashboard</h1>
        <p className="text-sm text-[#4A5568] mt-1">Overview of scholarship program status and pending tasks.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#A0AEC0]">
          Loading dashboard data...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard 
              title="Total Scholars" 
              value={stats.totalScholars} 
              icon={<GraduationCap size={24} />} 
              onClick={() => onNavigate('directory')}
            />
            <StatCard 
              title="Active Scholars" 
              value={stats.activeScholars} 
              icon={<CheckCircle size={24} />} 
              onClick={() => onNavigate('directory')}
            />
            <StatCard 
              title="Pending Items" 
              value={stats.pendingSubmissions} 
              icon={<ClipboardList size={24} />} 
              onClick={() => onNavigate('submissions')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-[#E0E6E0] p-8 shadow-sm">
              <h2 className="text-lg text-[#1A1A1A] mb-6">Action Required</h2>
              <div className="space-y-4">
                <div 
                  onClick={() => onNavigate('submissions')}
                  className="flex items-center justify-between p-4 bg-[#F7F9F7] rounded-xl hover:bg-[#E8F5ED] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><User size={20} /></div>
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">Profile Updates</p>
                      <p className="text-xs text-[#4A5568]">{stats.pendingProfiles} scholars requested profile changes</p>
                    </div>
                  </div>
                  <span className="text-[#A0AEC0] group-hover:text-[#1A8C3C] transition-colors">→</span>
                </div>

                <div 
                  onClick={() => onNavigate('submissions')}
                  className="flex items-center justify-between p-4 bg-[#F7F9F7] rounded-xl hover:bg-[#E8F5ED] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><FileText size={20} /></div>
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">Grade Submissions</p>
                      <p className="text-xs text-[#4A5568]">{stats.pendingGrades} semesters awaiting review</p>
                    </div>
                  </div>
                  <span className="text-[#A0AEC0] group-hover:text-[#1A8C3C] transition-colors">→</span>
                </div>

                <div 
                  onClick={() => onNavigate('submissions')}
                  className="flex items-center justify-between p-4 bg-[#F7F9F7] rounded-xl hover:bg-[#E8F5ED] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><FolderPlus size={20} /></div>
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">New Documents</p>
                      <p className="text-xs text-[#4A5568]">{stats.pendingDocs} documents uploaded for verification</p>
                    </div>
                  </div>
                  <span className="text-[#A0AEC0] group-hover:text-[#1A8C3C] transition-colors">→</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0F5C27] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-lg mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => onNavigate('bins')}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left group"
                  >
                    <FolderPlus size={24} className="mb-2" />
                    <p className="font-semibold text-sm">Create Bin</p>
                    <p className="text-[10px] text-white/60">Open new submission window</p>
                  </button>
                  <button 
                    onClick={() => onNavigate('announcements')}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-left group"
                  >
                    <Megaphone size={24} className="mb-2" />
                    <p className="font-semibold text-sm">Announce</p>
                    <p className="text-[10px] text-white/60">Broadcast to scholars</p>
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">System Status</span>
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-emerald-400" />
                      <span className="font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
