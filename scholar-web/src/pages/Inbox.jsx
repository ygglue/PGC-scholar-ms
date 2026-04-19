import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Inbox = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Scholar Communications</h1>
        <p className="text-on-surface-variant font-body">Manage your institutional updates and evaluator feedback.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 1: System Updates */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">System Updates</h2>
            <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[10px] font-bold">2 NEW</span>
          </div>

          <div className="bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border-l-8 border-palawan-yellow relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-palawan-yellow/10 text-on-surface">
                <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: '"FILL" 1'}}>warning</span>
              </div>
              <div>
                <h3 className="font-bold text-lg font-headline text-on-surface leading-tight mb-1">Missing Requirements</h3>
                <p className="text-sm text-on-surface-variant mb-4">Your Semester 2 grade report is pending verification. Please upload the PDF by Friday.</p>
                <button className="bg-on-surface text-surface px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all">Upload Now</button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[28px] p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary-fixed text-primary">
                <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: '"FILL" 1'}}>payments</span>
              </div>
              <div>
                <h3 className="font-bold text-lg font-headline text-on-surface leading-tight mb-1">Stipend Scheduled</h3>
                <p className="text-sm text-on-surface-variant mb-1">Processing for October allowance has begun. Expected arrival: Oct 15.</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Reference: #EST-9920</p>
              </div>
            </div>
          </div>

          <div className="bg-primary text-on-primary rounded-[32px] p-8 shadow-lg relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">Grantee Compliance</span>
              <div className="text-4xl font-extrabold font-headline mb-4">92%</div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-4">
                <div className="bg-white h-full w-[92%] rounded-full"></div>
              </div>
              <p className="text-xs opacity-90 font-medium">Keep it up! Complete your pending requirements to reach 100% standing.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Evaluator Remarks */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Evaluator Remarks</h2>
            <button className="text-primary text-xs font-bold flex items-center gap-1">
                Mark all read
                <span className="material-symbols-outlined text-sm">done_all</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm border border-transparent hover:border-primary-fixed transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high overflow-hidden border-2 border-primary/10">
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-on-surface font-headline">Dr. Helena Vance</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Research Supervisor</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">10:45 AM</span>
                  </div>
                  <p className="text-sm text-on-surface mb-4 leading-relaxed">
                     I've reviewed your thesis proposal. The methodology section is robust, but please clarify the sampling size. Excellent progress.
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-surface-container text-on-surface-variant px-5 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all scale-95 active:duration-150">
                        <span className="material-symbols-outlined text-sm">reply</span> Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Inbox;
