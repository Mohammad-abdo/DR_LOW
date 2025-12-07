import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Edit, Trash2, Save, Loader2, Video, FileText, X, ClipboardList } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";
import showToast from "@/lib/toast";

export default function AdminCourseContentManage() {
  const { courseId } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [contentItems, setContentItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "VIDEO",
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    content: "",
    duration: "",
    order: 0,
    isFree: false,
    chapterId: "",
    isIntroVideo: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [fileFile, setFileFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      console.log("Fetching content for course:", courseId);
      
      const [contentResponse, chaptersResponse] = await Promise.all([
        api.get(`/admin/courses/${courseId}/content`).catch((err) => {
          console.error("Error fetching content:", err);
          return null;
        }),
        api.get(`/admin/courses/${courseId}/chapters`).catch((err) => {
          console.error("Error fetching chapters:", err);
          return null;
        }),
      ]);
      
      console.log("Content Response:", contentResponse);
      console.log("Chapters Response:", chaptersResponse);
      
      // Fetch chapters
      if (chaptersResponse) {
        const chaptersData = extractDataFromResponse(chaptersResponse);
        console.log("Extracted Chapters Data:", chaptersData);
        const chaptersList = Array.isArray(chaptersData.chapters) 
          ? chaptersData.chapters 
          : (Array.isArray(chaptersData.data?.chapters) ? chaptersData.data.chapters : []);
        console.log("Chapters List:", chaptersList);
        setChapters(chaptersList);
      }
      
      // Fetch content
      if (contentResponse) {
        const data = extractDataFromResponse(contentResponse);
        console.log("Content API Response:", contentResponse);
        console.log("Extracted Content Data:", data);
        
        // Handle different response structures
        // API returns: { success: true, data: { chapters: [...], content: [...] } }
        let allContent = [];
        
        // The response structure is: { success: true, data: { chapters: [...], content: [...] } }
        // After extractDataFromResponse, it becomes: { chapters: [...], content: [...] } or { data: { chapters: [...], content: [...] } }
        
        // Try to get data from different possible structures
        let chaptersData = null;
        let standaloneContent = null;
        let allContentDirect = null;
        
        if (data.data) {
          // Structure: { data: { chapters: [...], content: [...], allContent: [...] } }
          chaptersData = data.data.chapters;
          standaloneContent = data.data.content;
          allContentDirect = data.data.allContent; // Use allContent if available (simpler)
        } else if (data.chapters || data.content || data.allContent) {
          // Structure: { chapters: [...], content: [...], allContent: [...] }
          chaptersData = data.chapters;
          standaloneContent = data.content;
          allContentDirect = data.allContent; // Use allContent if available (simpler)
        }
        
        // If allContent is available, use it directly (simplest approach)
        if (allContentDirect && Array.isArray(allContentDirect)) {
          allContent = allContentDirect;
          console.log("Using allContent directly:", allContent.length, "items");
        } else {
          // Otherwise, extract content from chapters and standalone content
          // Extract content from chapters
          if (chaptersData && Array.isArray(chaptersData)) {
            chaptersData.forEach(chapter => {
              if (chapter.content && Array.isArray(chapter.content)) {
                allContent = allContent.concat(chapter.content);
              }
            });
          }
          
          // Add standalone content (not in chapters)
          if (standaloneContent && Array.isArray(standaloneContent)) {
            allContent = allContent.concat(standaloneContent);
          }
          
          console.log("Extracted content from chapters and standalone:", allContent.length, "items");
        }
        
        // Also check if data itself is an array (fallback)
        if (allContent.length === 0 && Array.isArray(data)) {
          allContent = data;
          console.log("Using data as array directly:", allContent.length, "items");
        }
        
        // Sort by order if available
        allContent = allContent.sort((a, b) => (a.order || 0) - (b.order || 0));
        console.log("Final Content List:", allContent);
        console.log("Total content items:", allContent.length);
        setContentItems(allContent);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      showToast.error(error.response?.data?.message || (language === "ar" ? "خطأ في تحميل المحتوى" : "Error loading content"));
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type);
      formDataToSend.append("titleAr", formData.titleAr);
      formDataToSend.append("titleEn", formData.titleEn);
      formDataToSend.append("descriptionAr", formData.descriptionAr || "");
      formDataToSend.append("descriptionEn", formData.descriptionEn || "");
      formDataToSend.append("content", formData.content || "");
      formDataToSend.append("duration", formData.duration || "");
      formDataToSend.append("order", formData.order.toString());
      formDataToSend.append("isFree", formData.isFree.toString());
      // Always send chapterId and isIntroVideo, even if empty
      formDataToSend.append("chapterId", formData.chapterId || "");
      formDataToSend.append("isIntroVideo", formData.isIntroVideo.toString());
      
      if (videoFile) {
        formDataToSend.append("video", videoFile);
      }
      if (fileFile) {
        formDataToSend.append("file", fileFile);
      }

      if (editingId) {
        await api.put(`/admin/courses/${courseId}/content/${editingId}`, formDataToSend);
        showToast.success(language === "ar" ? "تم تحديث المحتوى بنجاح" : "Content updated successfully");
      } else {
        await api.post(`/admin/courses/${courseId}/content`, formDataToSend);
        showToast.success(language === "ar" ? "تم إنشاء المحتوى بنجاح" : "Content created successfully");
      }

      resetForm();
      fetchContent();
    } catch (error) {
      console.error("Error saving content:", error);
      let errorMessage = language === "ar" ? "خطأ في حفظ المحتوى" : "Error saving content";
      
      if (error.response?.status === 413) {
        errorMessage = language === "ar" 
          ? "الملف كبير جداً. الحد الأقصى لحجم الفيديو هو 5GB" 
          : "File too large. Maximum file size is 5GB for videos.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes('timeout')) {
        errorMessage = language === "ar" 
          ? "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى" 
          : "Request timeout. Please try again.";
      }
      
      showToast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      type: item.type,
      titleAr: item.titleAr,
      titleEn: item.titleEn,
      descriptionAr: item.descriptionAr || "",
      descriptionEn: item.descriptionEn || "",
      content: item.content || "",
      duration: item.duration?.toString() || "",
      order: item.order || 0,
      isFree: item.isFree || false,
      chapterId: item.chapterId || "",
      isIntroVideo: item.isIntroVideo || false,
    });
    setEditingId(item.id);
    setShowForm(true);
    setVideoFile(null);
    setFileFile(null);
    setVideoPreview(item.videoUrl ? getImageUrl(item.videoUrl) : null);
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/courses/${courseId}/content/${id}`);
      showToast.success(language === "ar" ? "تم الحذف بنجاح" : "Content deleted successfully");
      fetchContent();
    } catch (error) {
      showToast.error(error.response?.data?.message || (language === "ar" ? "خطأ في الحذف" : "Error deleting content"));
    }
  };

  const resetForm = () => {
    setFormData({
      type: "VIDEO",
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      content: "",
      duration: "",
      order: 0,
      isFree: false,
      chapterId: "",
      isIntroVideo: false,
    });
    setVideoFile(null);
    setFileFile(null);
    setVideoPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/admin/courses/${courseId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => {
              setFormData({
                type: "VIDEO",
                titleAr: "",
                titleEn: "",
                descriptionAr: "",
                descriptionEn: "",
                content: "",
                duration: "",
                order: 0,
                isFree: false,
                chapterId: "",
                isIntroVideo: true, // Set as course intro by default
              });
              setShowForm(true);
            }}
          >
            <Video className="w-4 h-4 mr-2" />
            {language === "ar" ? "إضافة فيديو مقدمة الدورة" : "Add Course Intro Video"}
          </Button>
          <Button onClick={() => {
            setFormData({
              type: "VIDEO",
              titleAr: "",
              titleEn: "",
              descriptionAr: "",
              descriptionEn: "",
              content: "",
              duration: "",
              order: 0,
              isFree: false,
              chapterId: "",
              isIntroVideo: false,
            });
            setShowForm(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            {language === "ar" ? "إضافة محتوى" : "Add Content"}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingId
                  ? language === "ar" ? "تعديل المحتوى" : "Edit Content"
                  : language === "ar" ? "إضافة محتوى جديد" : "Add New Content"}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "النوع" : "Type"} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="VIDEO">{language === "ar" ? "فيديو" : "Video"}</option>
                    <option value="QUIZ">{language === "ar" ? "امتحان/اختبار" : "Quiz/Exam"}</option>
                    <option value="PDF">{language === "ar" ? "PDF" : "PDF"}</option>
                    <option value="TEXT">{language === "ar" ? "نص" : "Text"}</option>
                    <option value="ASSIGNMENT">{language === "ar" ? "واجب" : "Assignment"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "الترتيب" : "Order"}
                  </label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              {formData.type === "VIDEO" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "فيديو" : "Video File"}
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {videoPreview && (
                    <div className="mt-2">
                      <video src={videoPreview} controls className="w-full max-w-md rounded" />
                    </div>
                  )}
                </div>
              )}

              {(formData.type === "PDF" || formData.type === "ASSIGNMENT") && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "ملف" : "File"}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
              )}

              {formData.type === "VIDEO" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "المدة (بالدقائق)" : "Duration (minutes)"}
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} *
                </label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  required
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"} *
                </label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </label>
                <Textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                />
              </div>

              {formData.type === "TEXT" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "المحتوى" : "Content"}
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                  />
                </div>
              )}

              {/* Course Intro Video Section - Separate and Clear */}
              {formData.type === "VIDEO" && (
                <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">
                    {language === "ar" ? "🎬 فيديو مقدمة الدورة" : "🎬 Course Intro Video"}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isIntroVideo"
                        checked={formData.isIntroVideo}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData({ 
                            ...formData, 
                            isIntroVideo: isChecked,
                            // If setting as course intro, remove chapter
                            chapterId: isChecked ? "" : formData.chapterId
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label htmlFor="isIntroVideo" className="text-sm font-semibold text-blue-900 cursor-pointer">
                        {language === "ar" ? "هذا فيديو مقدمة الدورة الرئيسي" : "This is the main course intro video"}
                      </label>
                    </div>
                    {formData.isIntroVideo && (
                      <div className="bg-blue-100 p-3 rounded text-sm text-blue-800">
                        <p className="font-medium mb-1">
                          {language === "ar" ? "ℹ️ ملاحظة مهمة:" : "ℹ️ Important Note:"}
                        </p>
                        <p>
                          {language === "ar" 
                            ? "فيديو مقدمة الدورة منفصل عن مقدمة الفصل. تأكد من عدم اختيار أي فصل أدناه."
                            : "Course intro video is separate from chapter intro. Make sure not to select any chapter below."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chapter Selection */}
              {chapters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "الفصل (اختياري)" : "Chapter (Optional)"}
                    {formData.isIntroVideo && (
                      <span className="text-red-600 ml-2">
                        {language === "ar" ? "(يجب أن يكون فارغاً لمقدمة الدورة)" : "(Must be empty for course intro)"}
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.chapterId}
                    onChange={(e) => {
                      const selectedChapterId = e.target.value;
                      setFormData({ 
                        ...formData, 
                        chapterId: selectedChapterId,
                        // If selecting a chapter, uncheck course intro
                        isIntroVideo: selectedChapterId ? false : formData.isIntroVideo
                      });
                    }}
                    className="w-full p-2 border rounded"
                    disabled={formData.isIntroVideo}
                  >
                    <option value="">{language === "ar" ? "بدون فصل (محتوى عام)" : "No Chapter (General Content)"}</option>
                    {chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {language === "ar" ? chapter.titleAr : chapter.titleEn}
                      </option>
                    ))}
                  </select>
                  {formData.isIntroVideo && formData.chapterId && (
                    <p className="text-xs text-red-600 mt-1">
                      {language === "ar" 
                        ? "⚠️ لا يمكن إضافة فيديو مقدمة الدورة إلى فصل. سيتم إلغاء تحديد الفصل تلقائياً."
                        : "⚠️ Course intro video cannot be added to a chapter. Chapter selection will be cleared automatically."}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isFree" className="text-sm font-medium">
                  {language === "ar" ? "مجاني" : "Free"}
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {language === "ar" ? "حفظ" : "Save"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {contentItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا يوجد محتوى بعد. ابدأ بإضافة محتوى جديد." : "No content yet. Start by adding new content."}
              </p>
            </CardContent>
          </Card>
        ) : (
          contentItems.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {item.type === "VIDEO" ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : item.type === "QUIZ" ? (
                        <ClipboardList className="w-5 h-5 text-orange-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                      <h3 className="font-semibold">
                        {language === "ar" ? item.titleAr : item.titleEn}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {item.type}
                      </span>
                      {item.order !== undefined && item.order !== null && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {language === "ar" ? `الترتيب: ${item.order}` : `Order: ${item.order}`}
                        </span>
                      )}
                      {item.isFree && (
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                          {language === "ar" ? "مجاني" : "Free"}
                        </span>
                      )}
                      {item.isIntroVideo && !item.chapterId && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                          {language === "ar" ? "🎬 مقدمة الدورة" : "🎬 Course Intro"}
                        </span>
                      )}
                      {item.isIntroVideo && item.chapterId && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                          {language === "ar" ? "📹 مقدمة الفصل" : "📹 Chapter Intro"}
                        </span>
                      )}
                    </div>
                    {item.descriptionEn && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === "ar" ? item.descriptionAr : item.descriptionEn}
                      </p>
                    )}
                    {item.videoUrl && (
                      <div className="mt-2">
                        <video src={getImageUrl(item.videoUrl)} controls className="w-full max-w-md rounded" />
                      </div>
                    )}
                    {item.fileUrl && (
                      <a
                        href={getImageUrl(item.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {language === "ar" ? "عرض الملف" : "View File"}
                      </a>
                    )}
                    {item.type === "QUIZ" && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${courseId}/quizzes?contentId=${item.id}`)}
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          {language === "ar" ? "إدارة الأسئلة" : "Manage Questions"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


