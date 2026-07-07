import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Wand2, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  Target, 
  Activity,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

import { reportApi, type Report } from '../lib/reportApi';
import { useAuth } from '../hooks/useAuth';

export function ReportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reportApi.listReports(projectId!);
      setReports(data);
      if (data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleGenerateReport = async () => {
    if (!projectId) return;
    try {
      setIsGenerating(true);
      setError(null);
      const newReport = await reportApi.generateReport(projectId);
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

  if (isLoading && reports.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex h-[calc(100vh-12rem)] gap-6">
      {/* Sidebar - Report List */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pr-6 overflow-y-auto hidden md:block">
        <div className="flex items-center justify-between mb-6 pt-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Reports</h2>
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full transition-colors disabled:opacity-50"
              title="Generate New Report"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-500/20 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm font-medium">
              No reports generated yet.
            </div>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selectedReportId === report.id
                    ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
                    {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </span>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md tracking-wide uppercase border ${
                    report.overallHealthScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                    report.overallHealthScore >= 60 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                  }`}>
                    <Activity className="h-3 w-3" />
                    {report.overallHealthScore}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {report.completedWork}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Selected Report */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedReport ? (
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pb-12"
            >
              {/* Header Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="md:hidden">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Report</h2>
                </div>
                <div className="ml-auto flex gap-3">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Printable Report Container */}
              <div 
                ref={reportRef} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-subtle overflow-hidden p-8"
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                          <Wand2 className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Weekly AI Status Report</h1>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />
                        Generated on {format(new Date(selectedReport.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Overall Health</div>
                      <div className={`text-4xl font-extrabold tracking-tight ${
                        selectedReport.overallHealthScore >= 80 ? 'text-emerald-500' :
                        selectedReport.overallHealthScore >= 60 ? 'text-amber-500' :
                        'text-red-500'
                      }`}>
                        {selectedReport.overallHealthScore}
                        <span className="text-lg text-slate-300 dark:text-slate-600 ml-1">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Completed Work */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Completed Work</h3>
                    </div>
                    <div className="p-5 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed text-sm shadow-sm">
                      {selectedReport.completedWork}
                    </div>
                  </div>

                  {/* Pending Work */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-violet-500" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Work</h3>
                    </div>
                    <div className="p-5 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed text-sm h-[calc(100%-2.5rem)] shadow-sm">
                      {selectedReport.pendingWork}
                    </div>
                  </div>

                  {/* Next Week Plan */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Next Week Plan</h3>
                    </div>
                    <div className="p-5 border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/10 rounded-xl text-indigo-900 dark:text-indigo-200 leading-relaxed text-sm h-[calc(100%-2.5rem)] shadow-sm">
                      {selectedReport.nextWeekPlan}
                    </div>
                  </div>

                  {/* Risks & Blockers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-1 md:col-span-2 mt-4">
                    <div className="p-5 border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/10 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h4 className="font-bold text-amber-900 dark:text-amber-400">Risks</h4>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">{selectedReport.risks}</p>
                    </div>

                    <div className="p-5 border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/10 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        <h4 className="font-bold text-red-900 dark:text-red-400">Blockers</h4>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200/80 leading-relaxed">{selectedReport.blockers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
              {reports.length === 0 ? "Generate a report to get started." : "Select a report to view details."}
            </div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
