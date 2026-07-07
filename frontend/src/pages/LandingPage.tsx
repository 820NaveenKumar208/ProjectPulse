import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Shield,
  Zap,
  FolderKanban,
  CheckSquare,
  FileText,
  Activity,
  Heart,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLiveDemo = async () => {
    setIsDemoLoading(true);
    try {
      await login({ email: 'manager@projectpulse.test', password: 'Password123!' });
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed, falling back to login page:', err);
      navigate('/login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-500/30 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-bold shadow-md shadow-violet-500/25">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ProjectPulse</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-slate-900 dark:bg-white px-5 py-2 text-sm font-bold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md shadow-slate-900/10 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden max-w-7xl mx-auto">
        <motion.div
          className="text-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeIn}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/30 px-3.5 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400"
          >
            <SparklesIcon className="h-3.5 w-3.5 animate-pulse" />
            <span>Next-Gen Client Portals</span>
          </motion.div>
          
          <motion.h1
            variants={fadeIn}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 mb-6 leading-[1.15]"
          >
            ProjectPulse <br />
            <span className="text-violet-600 dark:text-violet-400">AI-Powered Client Visibility Platform</span>
          </motion.h1>
          
          <motion.p
            variants={fadeIn}
            className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
          >
            radically improve transparency, manage client sign-offs, and generate automated project reports in seconds.
          </motion.p>

          {/* Highlights Chips */}
          <motion.div
            variants={fadeIn}
            className="mx-auto mb-10 flex flex-wrap justify-center gap-3.5 max-w-xl"
          >
            {[
              { text: 'Track Projects', color: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-400' },
              { text: 'Approve Milestones', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400' },
              { text: 'Generate Reports', color: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-400' },
            ].map((chip, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${chip.color}`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {chip.text}
              </span>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex h-12 items-center justify-center gap-2 rounded-full bg-violet-600 px-8 text-sm font-bold text-white transition-all hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95 w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={handleLiveDemo}
              disabled={isDemoLoading}
              className="group flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm active:scale-95 w-full sm:w-auto disabled:opacity-50"
            >
              {isDemoLoading ? 'Entering Demo...' : 'Live Demo'}
              {!isDemoLoading && <Zap className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />}
            </button>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mx-auto mt-20 max-w-5xl relative"
          id="demo"
        >
          {/* Radial decorative glow background */}
          <div className="absolute inset-0 -top-12 -bottom-12 -left-12 -right-12 bg-gradient-to-b from-violet-500/10 to-transparent dark:from-violet-500/5 rounded-[4rem] blur-3xl -z-10" />
          
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-2 shadow-2xl backdrop-blur-xl">
            {/* Browser frame */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-[#0B1120] flex flex-col aspect-[16/10] shadow-sm select-none">
              
              {/* Browser Header / Controls */}
              <div className="flex h-10 w-full items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70 bg-slate-100/70 dark:bg-slate-900/70 px-4">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                {/* URL Bar */}
                <div className="w-80 rounded-md bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 px-3 py-1 text-[10px] text-slate-400 text-center font-medium truncate">
                  app.projectpulse.co/dashboard
                </div>
                {/* Empty spacer for balance */}
                <div className="w-12" />
              </div>

              {/* Mock App Layout */}
              <div className="flex flex-1 overflow-hidden">
                {/* Mock Sidebar */}
                <div className="w-14 sm:w-44 border-r border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900/70 p-2 flex flex-col gap-5">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-bold text-white shadow-sm">P</span>
                    <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 hidden sm:inline">ProjectPulse</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { icon: FolderKanban, label: 'Dashboard', active: true },
                      { icon: FolderKanban, label: 'Projects' },
                      { icon: CheckSquare, label: 'Approvals' },
                      { icon: FileText, label: 'Reports' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                          item.active
                            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Main Content Panel */}
                <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto bg-slate-50/50 dark:bg-[#0B1120]/50 flex flex-col gap-4">
                  {/* Mock Breadcrumbs & Search */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overview Dashboard</p>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">Welcome back, Naveen</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-16 sm:w-28 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                      <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-850 flex items-center justify-center text-[10px] font-bold text-violet-655 dark:text-violet-400">N</div>
                    </div>
                  </div>

                  {/* Mock KPI Cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: 'Active Projects', value: '12', icon: FolderKanban, desc: '3 projects completed' },
                      { label: 'Pending Approvals', value: '5', icon: CheckSquare, desc: 'Awaiting client sign-off' },
                      { label: 'Portfolio Health', value: '88%', icon: Heart, desc: 'Average health score' },
                    ].map((card, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/20 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/80 p-2.5 sm:p-3.5 shadow-sm backdrop-blur-sm flex justify-between items-start"
                      >
                        <div>
                          <p className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.label}</p>
                          <p className="text-sm sm:text-lg font-extrabold text-slate-800 dark:text-white mt-1">{card.value}</p>
                          <p className="text-[7px] text-slate-400 dark:text-slate-500 mt-1 hidden sm:block">{card.desc}</p>
                        </div>
                        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-300">
                          <card.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Portfolio Mock Table & Activity Feed */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Left Portfolio Section */}
                    <div className="sm:col-span-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">Active Portfolio</span>
                          <span className="text-[8px] font-bold text-violet-600 dark:text-violet-400">View All</span>
                        </div>
                        
                        <div className="mt-2.5 space-y-2">
                          {[
                            { name: 'ProjectPulse Website', progress: 78, score: 95, statusColor: 'bg-emerald-500' },
                            { name: 'SmartShop Buddy', progress: 65, score: 65, statusColor: 'bg-violet-500' },
                            { name: 'AI Resume Analyzer', progress: 91, score: 91, statusColor: 'bg-emerald-500' },
                          ].map((p, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {/* Health Score representation */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`h-1.5 w-1.5 rounded-full ${p.statusColor}`} />
                                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">H: {p.score}</span>
                                </div>
                                {/* Mini Progress */}
                                <div className="w-14 shrink-0">
                                  <div className="flex justify-between text-[7px] font-bold text-slate-400 mb-0.5">
                                    <span>PROGRESS</span>
                                    <span>{p.progress}%</span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${p.progress}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Activity Stream Section */}
                    <div className="rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/80 p-3.5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">Activity Stream</span>
                          <Activity className="h-3 w-3 text-slate-400" />
                        </div>

                        <div className="mt-2.5 space-y-2.5 max-h-[120px] overflow-hidden">
                          {[
                            { title: 'Share Links Approved', text: 'Client signed off on token auth features.', time: '2h ago' },
                            { title: 'Project Initialized', text: 'New portal env created successfully.', time: 'Yesterday' },
                          ].map((act, index) => (
                            <div key={index} className="flex gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-1 shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[8px] font-bold text-slate-800 dark:text-white truncate">{act.title}</p>
                                  <span className="text-[7px] text-slate-400 shrink-0">{act.time}</span>
                                </div>
                                <p className="text-[7px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{act.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#0B1120]/30 border-y border-slate-200/50 dark:border-slate-850 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">Everything you need to deliver</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Powerful features designed to keep your projects on track and your clients happy.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="h-6 w-6 text-violet-550 dark:text-violet-400" />,
                title: 'Project Tracking',
                desc: 'Real-time visibility into milestones, tasks, and overall project health.',
              },
              {
                icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
                title: 'Client Approvals',
                desc: 'Streamlined workflow for clients to review and approve deliverables.',
              },
              {
                icon: <FileText className="h-6 w-6 text-purple-500" />,
                title: 'AI Reports',
                desc: 'Instantly generate beautiful, AI-summarized PDF reports for stakeholders.',
              },
              {
                icon: <Shield className="h-6 w-6 text-rose-500" />,
                title: 'Role-Based Access',
                desc: 'Secure environments for Admins, Managers, and Clients.',
              },
              {
                icon: <FolderKanban className="h-6 w-6 text-indigo-500" />,
                title: 'Clean Dashboards',
                desc: 'Dynamic summary screens aggregating portfolios and sign-off statuses.',
              },
              {
                icon: <Activity className="h-6 w-6 text-amber-500" />,
                title: 'Real-time Updates',
                desc: 'Client activity logs and action-required items notify stakeholders instantly.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-subtle hover:shadow-md transition-all hover:border-violet-200 dark:hover:border-violet-800/50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">Built for modern teams</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Whether you're a solo freelancer or a growing agency, ProjectPulse scales with your needs.
            </p>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
            {[
              { target: 'Agencies', text: 'Manage dozens of concurrent client projects without dropping the ball.' },
              { target: 'Freelancers', text: 'Look incredibly professional with a branded client portal.' },
              { target: 'Startups', text: 'Keep investors and stakeholders in the loop with automated reporting.' },
              { target: 'Consultancies', text: 'Document scope delivery and request formal approvals upon milestone check-offs.' }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="h-2 w-2 rounded-full bg-violet-500" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-slate-800 dark:text-white">{benefit.target}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] py-12 transition-colors">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-violet-500/20">
              P
            </div>
            <span className="font-bold text-slate-900 dark:text-white">ProjectPulse</span>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Built by Naveen Kumar</p>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium">React • TypeScript • Node.js • MongoDB</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 6 5 3Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}
