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
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';

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

  useEffect(() => {
    if (projectId) {
      loadReports();
    }
  }, [projectId]);

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
    <main className="min-h-screen bg-pulse-background text-pulse-text">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex h-[calc(100vh-12rem)] gap-6">
      {/* Sidebar - Report List */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-slate-50/50 pr-6 overflow-y-auto hidden md:block">
        <div className="flex items-center justify-between mb-6 pt-2">
          <h2 className="text-lg font-semibold text-slate-900">AI Reports</h2>
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors disabled:opacity-50"
              title="Generate New Report"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No reports generated yet.
            </div>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  selectedReportId === report.id
                    ? 'bg-white shadow-sm ring-1 ring-slate-200'
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </span>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    report.overallHealthScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    report.overallHealthScore >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <Activity className="h-3 w-3" />
                    {report.overallHealthScore}
                  </div>
                </div>
                <div className="text-xs text-slate-500 line-clamp-2">
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
                   <h2 className="text-xl font-semibold text-slate-900">AI Report</h2>
                </div>
                <div className="ml-auto flex gap-3">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Printable Report Container */}
              <div 
                ref={reportRef} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8"
              >
                <div className="border-b border-slate-100 pb-8 mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Wand2 className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Weekly AI Status Report</h1>
                      </div>
                      <p className="text-slate-500 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Generated on {format(new Date(selectedReport.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-500 mb-1">Overall Health</div>
                      <div className={`text-4xl font-bold ${
                        selectedReport.overallHealthScore >= 80 ? 'text-emerald-500' :
                        selectedReport.overallHealthScore >= 60 ? 'text-amber-500' :
                        'text-red-500'
                      }`}>
                        {selectedReport.overallHealthScore}
                        <span className="text-lg text-slate-400 ml-1">/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Completed Work */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <h3 className="text-lg font-semibold text-slate-900">Completed Work</h3>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                      {selectedReport.completedWork}
                    </div>
                  </div>

                  {/* Pending Work */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-slate-900">Pending Work</h3>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl text-slate-700 leading-relaxed h-[calc(100%-2rem)]">
                      {selectedReport.pendingWork}
                    </div>
                  </div>

                  {/* Next Week Plan */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-slate-900">Next Week Plan</h3>
                    </div>
                    <div className="p-5 bg-indigo-50/50 rounded-xl text-slate-700 leading-relaxed h-[calc(100%-2rem)]">
                      {selectedReport.nextWeekPlan}
                    </div>
                  </div>

                  {/* Risks & Blockers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-1 md:col-span-2 mt-4">
                    <div className="p-5 border border-amber-100 bg-amber-50/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h4 className="font-semibold text-slate-900">Risks</h4>
                      </div>
                      <p className="text-sm text-slate-700">{selectedReport.risks}</p>
                    </div>

                    <div className="p-5 border border-red-100 bg-red-50/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        <h4 className="font-semibold text-slate-900">Blockers</h4>
                      </div>
                      <p className="text-sm text-slate-700">{selectedReport.blockers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              {reports.length === 0 ? "Generate a report to get started." : "Select a report to view details."}
            </div>
          )}
        </AnimatePresence>
      </div>
        </div>
      </div>
    </main>
  );
}
