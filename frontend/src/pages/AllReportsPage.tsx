import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project } from '../lib/projectApi';
import { reportApi, type Report } from '../lib/reportApi';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  FileText,
  Wand2,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Target,
  CheckCircle2,
  Clock,
  Loader2,
  Download,
  FolderKanban,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export function AllReportsPage() {
  const { accessToken, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  // Load all accessible projects
  useEffect(() => {
    if (!accessToken) return;
    setProjectsLoading(true);
    projectAPI
      .listProjects(accessToken, { limit: 100 })
      .then((res) => {
        setProjects(res.projects);
        if (res.projects.length > 0) {
          setSelectedProjectId(res.projects[0].id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load projects.');
      })
      .finally(() => {
        setProjectsLoading(false);
      });
  }, [accessToken]);

  // Load reports for selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    loadReports(selectedProjectId);
  }, [selectedProjectId]);

  const loadReports = async (projId: string) => {
    setReportsLoading(true);
    setError(null);
    try {
      const data = await reportApi.listReports(projId);
      setReports(data);
      if (data.length > 0) {
        setSelectedReportId(data[0].id);
      } else {
        setSelectedReportId(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProjectId) return;
    try {
      setIsGenerating(true);
      setError(null);
      const newReport = await reportApi.generateReport(selectedProjectId);
      setReports((prev) => [newReport, ...prev]);
      setSelectedReportId(newReport.id);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return;
    
    try {
      setIsExporting(true);
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const reportName = selectedReport ? `Project_Report_${format(new Date(selectedReport.createdAt), 'yyyy-MM-dd')}.pdf` : 'Project_Report.pdf';
      pdf.save(reportName);
      
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  if (projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
        <LoadingState type="list" rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-label="Reports page header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">AI Weekly Reports</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Centralized Reports
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Select an active project workspace to view generated AI progress summaries.
          </p>
        </div>

        {/* Project Selector dropdown */}
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-slate-400" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition font-medium text-slate-700 dark:text-slate-300"
          >
            {projects.length === 0 ? (
              <option value="">No projects found</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects configured"
          description="Create a project to generate status reports."
          icon={FolderKanban}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-4 min-h-[500px]">
          {/* Sidebar - Report List */}
          <section className="lg:col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm flex flex-col h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Generated Reports</h3>
              {(user?.role === 'manager' || user?.role === 'admin') && selectedProjectId && (
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || reportsLoading}
                  className="p-1.5 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 rounded-lg transition disabled:opacity-50"
                  title="Generate New Report"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                </button>
              )}
            </div>

            {reportsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600 dark:text-violet-400" />
              </div>
            ) : reports.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <p className="text-xs text-slate-400">No reports generated for this project yet.</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-2 border ${
                      selectedReportId === report.id
                        ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold">
                        {format(new Date(report.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        report.overallHealthScore >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : report.overallHealthScore >= 60
                          ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      Score: {report.overallHealthScore}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Main Content - Selected Report */}
          <section className="lg:col-span-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm overflow-hidden flex flex-col justify-between">
            {reportsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
              </div>
            ) : selectedReport ? (
              <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      Weekly Progress Update
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Generated {format(new Date(selectedReport.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    Export PDF
                  </button>
                </div>

                {/* Report Content Body */}
                <div ref={reportRef} className="space-y-6 bg-white dark:bg-transparent p-2 text-slate-800 dark:text-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Completed */}
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed Work
                      </h4>
                      <p className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedReport.completedWork}
                      </p>
                    </div>

                    {/* Pending */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Pending Work
                      </h4>
                      <p className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed h-[120px] overflow-y-auto">
                        {selectedReport.pendingWork}
                      </p>
                    </div>

                    {/* Plan */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Next Week Plan
                      </h4>
                      <p className="p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/30 bg-cyan-50/20 dark:bg-cyan-950/10 text-xs text-slate-700 dark:text-slate-300 leading-relaxed h-[120px] overflow-y-auto">
                        {selectedReport.nextWeekPlan}
                      </p>
                    </div>

                    {/* Risks & Blockers */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10">
                        <h5 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-2">
                           <AlertTriangle className="h-4 w-4" />
                           Risks Identified
                         </h5>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{selectedReport.risks}</p>
                       </div>
 
                      <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10">
                        <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 mb-2">
                           <ShieldAlert className="h-4 w-4" />
                           Blockers
                         </h5>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{selectedReport.blockers}</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                 <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                 <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-200">No report selected</h4>
                 <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Select a weekly report from the sidebar list.</p>
               </div>
             )}
           </section>
        </div>
      )}
    </div>
  );
}
