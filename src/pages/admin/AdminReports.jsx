import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Loader2 } from "lucide-react";
import showToast from "@/lib/toast";

export default function AdminReports() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("students");
  const [format, setFormat] = useState("pdf");
  const [studentId, setStudentId] = useState("");

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      let endpoint = "";
      let params = { format };

      switch (reportType) {
        case "students":
          endpoint = "/admin/reports/students";
          break;
        case "teachers":
          endpoint = "/admin/reports/teachers";
          break;
        case "courses":
          endpoint = "/admin/reports/courses";
          break;
        case "financial":
          endpoint = "/admin/reports/financial";
          break;
        case "student":
          if (!studentId) {
            showToast.error(language === "ar" ? "الرجاء إدخال معرف الطالب" : "Please enter student ID");
            return;
          }
          endpoint = `/admin/reports/student/${studentId}`;
          params = { ...params, type: "enrollment" };
          break;
        default:
          endpoint = "/admin/reports/system";
      }

      const response = await api.get(endpoint, {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast.success(language === "ar" ? "تم تحميل التقرير بنجاح" : "Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || (language === "ar" ? "حدث خطأ أثناء إنشاء التقرير" : "Error generating report");
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "التقارير" : "Reports"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "إنشاء تقرير" : "Generate Report"}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === "ar" ? "نوع التقرير" : "Report Type"}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="students">{language === "ar" ? "الطلاب" : "Students"}</option>
              <option value="teachers">{language === "ar" ? "المعلمون" : "Teachers"}</option>
              <option value="courses">{language === "ar" ? "الدورات" : "Courses"}</option>
              <option value="financial">{language === "ar" ? "المالية" : "Financial"}</option>
              <option value="system">{language === "ar" ? "النظام" : "System"}</option>
              <option value="student">{language === "ar" ? "تقرير طالب محدد" : "Specific Student"}</option>
            </select>
          </div>

          {reportType === "student" && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "معرف الطالب" : "Student ID"}
              </label>
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={language === "ar" ? "أدخل معرف الطالب" : "Enter student ID"}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              {language === "ar" ? "التنسيق" : "Format"}
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === "ar" ? "جاري الإنشاء..." : "Generating..."}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {language === "ar" ? "إنشاء وتحميل التقرير" : "Generate & Download Report"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "التقارير المتاحة" : "Available Reports"}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: "students", title: language === "ar" ? "تقرير الطلاب" : "Students Report", desc: language === "ar" ? "قائمة بجميع الطلاب" : "List of all students" },
              { type: "teachers", title: language === "ar" ? "تقرير المعلمين" : "Teachers Report", desc: language === "ar" ? "قائمة بجميع المعلمين" : "List of all teachers" },
              { type: "courses", title: language === "ar" ? "تقرير الدورات" : "Courses Report", desc: language === "ar" ? "قائمة بجميع الدورات" : "List of all courses" },
              { type: "financial", title: language === "ar" ? "التقرير المالي" : "Financial Report", desc: language === "ar" ? "الإيرادات والمدفوعات" : "Revenue and payments" },
            ].map((report) => (
              <motion.div
                key={report.type}
                whileHover={{ scale: 1.02 }}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setReportType(report.type);
                  handleGenerateReport();
                }}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



