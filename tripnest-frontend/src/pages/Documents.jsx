import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { documentAPI, tripAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const DOC_TYPES = [
  { value: "FLIGHT_TICKET", label: "Flight Ticket", emoji: "✈️" },
  { value: "HOTEL_BOOKING", label: "Hotel Booking", emoji: "🏨" },
  { value: "TRAIN_TICKET", label: "Train Ticket", emoji: "🚂" },
  { value: "BUS_TICKET", label: "Bus Ticket", emoji: "🚌" },
  { value: "TRAVEL_DOCUMENT", label: "Travel Document", emoji: "📄" },
  { value: "ITINERARY", label: "Itinerary", emoji: "🗺️" },
  { value: "PHOTO", label: "Photo", emoji: "📸" },
  { value: "EXPENSE_RECEIPT", label: "Expense Receipt", emoji: "🧾" },
  { value: "OTHER", label: "Other", emoji: "📁" },
];

const FILTERS = [
  { value: "ALL", label: "All files" },
  { value: "PHOTO", label: "Photos" },
  { value: "FLIGHT_TICKET", label: "Tickets" },
  { value: "HOTEL_BOOKING", label: "Bookings" },
  { value: "EXPENSE_RECEIPT", label: "Receipts" },
  { value: "OTHER", label: "Others" },
];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const initialForm = {
  documentType: "OTHER",
  description: "",
};

const getId = (item) => item?.id ?? item?._id;

const getDocTypeInfo = (type) =>
  DOC_TYPES.find((item) => item.value === type) ||
  { emoji: "📁", label: "Other" };

const formatFileSize = (bytes) => {
  if (bytes == null || !Number.isFinite(Number(bytes))) return "";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Documents = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fileInputRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [trip, setTrip] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [filter, setFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("docs");
  const [showUpload, setShowUpload] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const clearSuccessTimeout = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setPreviewUrl(null);
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    clearPreview();
    setForm(initialForm);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showSuccessMessage = (message) => {
    clearSuccessTimeout();
    setSuccess(message);

    successTimeoutRef.current = setTimeout(() => {
      setSuccess("");
      successTimeoutRef.current = null;
    }, 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [tripResponse, docsResponse] = await Promise.all([
        tripAPI.getById(tripId),
        documentAPI.getAll(tripId),
      ]);

      const tripData = tripResponse?.data;
      const docsData = Array.isArray(docsResponse?.data)
        ? docsResponse.data
        : [];

      if (!tripData) {
        throw new Error("Trip details could not be loaded.");
      }

      setTrip(tripData);
      setDocuments(docsData);
    } catch (err) {
      console.error("Documents loading failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load trip documents."
      );
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      clearProgressInterval();
      clearSuccessTimeout();

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File too large: ${formatFileSize(file.size)}. Maximum allowed size is 10 MB.`
      );
      event.target.value = "";
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "File type not allowed. Please choose an image, PDF, Word document or text file."
      );
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    clearPreview();

    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);

      setForm((previous) => ({
        ...previous,
        documentType: "PHOTO",
      }));
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("The selected file exceeds the 10 MB limit.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentType", form.documentType);
    formData.append("description", form.description.trim());

    // Visual progress indicator; actual upload progress depends on the API.
    clearProgressInterval();

    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((previous) => {
        if (previous >= 90) {
          clearProgressInterval();
          return previous;
        }

        return Math.min(previous + 10, 90);
      });
    }, 250);

    try {
      const response = await documentAPI.upload(tripId, formData);
      const uploadedDocument = response?.data;

      if (!uploadedDocument) {
        throw new Error("The server did not return the uploaded document.");
      }

      clearProgressInterval();
      setUploadProgress(100);

      setDocuments((previous) => [
        uploadedDocument,
        ...previous.filter(
          (doc) => String(getId(doc)) !== String(getId(uploadedDocument))
        ),
      ]);

      resetUploadForm();
      setShowUpload(false);
      showSuccessMessage("File uploaded successfully.");
    } catch (err) {
      console.error("Document upload failed:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again."
      );
      setUploadProgress(0);
    } finally {
      clearProgressInterval();
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (deletingId !== null) return;

    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    setDeletingId(docId);
    setError("");
    setSuccess("");

    try {
      await documentAPI.delete(docId);

      setDocuments((previous) =>
        previous.filter(
          (doc) => String(getId(doc)) !== String(docId)
        )
      );

      showSuccessMessage("File deleted successfully.");
    } catch (err) {
      console.error("Document deletion failed:", err);

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Unable to delete this file."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const currentEmail = (
    user?.email || ""
  ).toLowerCase();

  const canDelete = (doc) => {
    const uploaderEmail = (
      doc?.uploadedByEmail || ""
    ).toLowerCase();

    const ownerEmail = (
      trip?.ownerEmail || ""
    ).toLowerCase();

    return Boolean(
      currentEmail &&
        (uploaderEmail === currentEmail ||
          ownerEmail === currentEmail)
    );
  };

  const isImage = (fileType) =>
    Boolean(fileType && fileType.startsWith("image/"));

  const photos = documents.filter(
    (doc) => doc.documentType === "PHOTO"
  );

  const nonPhotoDocuments = documents.filter(
    (doc) => doc.documentType !== "PHOTO"
  );

  const filteredDocs = nonPhotoDocuments.filter((doc) => {
    if (filter === "ALL") return true;

    if (filter === "OTHER") {
      return (
        doc.documentType === "OTHER" ||
        !DOC_TYPES.some(
          (type) => type.value === doc.documentType
        )
      );
    }

    return doc.documentType === filter;
  });

  const openUploadForm = (type = "OTHER") => {
    setError("");
    setSuccess("");
    setForm((previous) => ({
      ...previous,
      documentType: type,
    }));
    setShowUpload(true);
  };

  const closeUploadForm = () => {
    if (uploading) return;

    setShowUpload(false);
    setError("");
    resetUploadForm();
  };

  const documentCount = nonPhotoDocuments.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mb-6 h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mb-8 h-36 animate-pulse rounded-3xl bg-white shadow-sm" />

          <div className="mb-6 h-14 animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate(`/trips/${tripId}`)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <span>←</span> Back to trip
        </button>

        {/* Page header */}
        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 shadow-lg shadow-blue-600/10 sm:p-8">
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                📂 TRIP LIBRARY
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Documents & Photos
              </h1>

              <p className="mt-2 max-w-xl break-words text-sm leading-6 text-blue-100">
                {trip?.title || "Your trip"} — keep tickets, bookings,
                receipts and memories in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showUpload) {
                  closeUploadForm();
                } else {
                  openUploadForm();
                }
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-50"
              disabled={uploading}
            >
              <span>{showUpload ? "−" : "+"}</span>
              {showUpload ? "Close upload" : "Upload file"}
            </button>
          </div>

          <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Documents",
                value: documentCount,
                icon: "📄",
              },
              {
                label: "Photos",
                value: photos.length,
                icon: "📸",
              },
              {
                label: "Upload limit",
                value: "10 MB",
                icon: "☁️",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-xs text-blue-100">
                  {item.icon} {item.label}
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Success and error messages */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <span>✓</span>
            <p className="flex-1">{success}</p>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>⚠️</span>
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error message"
              className="font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload form */}
        {showUpload && (
          <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Add to your trip
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Upload a new file
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Supported: images, PDF, Word and text files. Maximum size: 10 MB.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              {/* File selection */}
              <div>
                <label className={labelClass}>Choose a file *</label>

                <div
                  className={`rounded-2xl border-2 border-dashed p-5 text-center transition sm:p-8 ${
                    selectedFile
                      ? "border-blue-400 bg-blue-50/60"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Selected file preview"
                      className="mx-auto h-36 w-36 rounded-2xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                      {selectedFile ? "📄" : "📤"}
                    </div>
                  )}

                  {selectedFile ? (
                    <>
                      <p className="mx-auto mt-4 max-w-full break-all text-sm font-semibold text-slate-800">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-sm font-semibold text-slate-800">
                        Select a file from your device
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Images, PDF, Word documents and text files
                      </p>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                  >
                    {selectedFile ? "Choose another file" : "Browse files"}
                  </button>
                </div>
              </div>

              {/* Document category */}
              <div>
                <label className={labelClass}>Document category</label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {DOC_TYPES.map((type) => {
                    const selected = form.documentType === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        disabled={uploading}
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            documentType: type.value,
                          }))
                        }
                        className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition disabled:opacity-50 ${
                          selected
                            ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xl">{type.emoji}</span>
                        <span className="text-xs font-semibold">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>
                  Description{" "}
                  <span className="font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={form.description}
                  maxLength={250}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="e.g. Mumbai to Goa flight ticket"
                  className={inputClass}
                  disabled={uploading}
                />
              </div>

              {/* Upload progress */}
              {uploading && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeUploadForm}
                  disabled={uploading}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "↑ Upload file"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Main content card */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Tabs */}
          <div className="border-b border-slate-100 p-3 sm:px-5">
            <div className="flex gap-2">
              {[
                {
                  id: "docs",
                  label: "Documents",
                  count: documentCount,
                  icon: "📂",
                },
                {
                  id: "photos",
                  label: "Photos",
                  count: photos.length,
                  icon: "📸",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-7">
            {/* DOCUMENTS TAB */}
            {activeTab === "docs" && (
              <div>
                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {FILTERS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        filter === item.value
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {filteredDocs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                    <div className="text-4xl">📂</div>
                    <h3 className="mt-4 font-bold text-slate-900">
                      {documentCount === 0
                        ? "No documents yet"
                        : "No files match this filter"}
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      {documentCount === 0
                        ? "Upload tickets, booking confirmations, receipts or other important travel documents."
                        : "Try a different category to find your file."}
                    </p>

                    {documentCount === 0 && (
                      <button
                        type="button"
                        onClick={() => openUploadForm()}
                        className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        + Upload first file
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocs.map((doc) => {
                      const docId = getId(doc);
                      const info = getDocTypeInfo(doc.documentType);
                      const fileName =
                        doc.originalFileName ||
                        doc.fileName ||
                        "Untitled file";
                      const fileUrl = doc.fileUrl;

                      return (
                        <article
                          key={docId}
                          className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {/* File icon */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                              {isImage(doc.fileType) && fileUrl ? (
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-2xl">
                                  {info.emoji}
                                </span>
                              )}
                            </div>

                            {/* File information */}
                            <div className="min-w-0 flex-1">
                              <h3
                                className="break-words text-sm font-bold text-slate-900"
                                title={fileName}
                              >
                                {fileName}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                  {info.label}
                                </span>

                                {doc.fileSizeFormatted && (
                                  <span className="text-xs text-slate-400">
                                    {doc.fileSizeFormatted}
                                  </span>
                                )}

                                {doc.uploadedByName && (
                                  <span className="text-xs text-slate-400">
                                    Uploaded by {doc.uploadedByName}
                                  </span>
                                )}
                              </div>

                              {doc.description && (
                                <p className="mt-2 break-words text-xs leading-5 text-slate-500">
                                  {doc.description}
                                </p>
                              )}
                            </div>

                            {/* File actions */}
                            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                              {fileUrl && (
                                <>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                                  >
                                    View
                                  </a>

                                  <a
                                    href={fileUrl}
                                    download={fileName}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                  >
                                    Download
                                  </a>
                                </>
                              )}

                              {canDelete(doc) && (
                                <button
                                  type="button"
                                  disabled={deletingId !== null}
                                  onClick={() => handleDelete(docId)}
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                  {String(deletingId) === String(docId)
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PHOTOS TAB */}
            {activeTab === "photos" && (
              <div>
                {photos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                    <div className="text-4xl">📸</div>
                    <h3 className="mt-4 font-bold text-slate-900">
                      No trip photos yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Upload photos to build a gallery of your trip memories.
                    </p>

                    <button
                      type="button"
                      onClick={() => openUploadForm("PHOTO")}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      + Upload photos
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-900">
                          Trip gallery
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {photos.length}{" "}
                          {photos.length === 1 ? "photo" : "photos"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openUploadForm("PHOTO")}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        + Add photo
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {photos.map((photo) => {
                        const photoId = getId(photo);
                        const fileName =
                          photo.originalFileName ||
                          photo.fileName ||
                          "Trip photo";

                        return (
                          <article
                            key={photoId}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md"
                          >
                            <div className="relative aspect-square overflow-hidden bg-slate-100">
                              {photo.fileUrl ? (
                                <a
                                  href={photo.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`View ${fileName}`}
                                  className="block h-full w-full"
                                >
                                  <img
                                    src={photo.fileUrl}
                                    alt={fileName}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                </a>
                              ) : (
                                <div className="flex h-full items-center justify-center text-4xl">
                                  📸
                                </div>
                              )}

                              <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-slate-900/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                                {photo.uploadedByName || "Trip photo"}
                              </span>
                            </div>

                            <div className="p-3">
                              <p
                                className="truncate text-xs font-semibold text-slate-800"
                                title={fileName}
                              >
                                {fileName}
                              </p>

                              <div className="mt-3 flex gap-2">
                                {photo.fileUrl && (
                                  <a
                                    href={photo.fileUrl}
                                    download={fileName}
                                    className="flex-1 rounded-lg border border-slate-200 px-2 py-2 text-center text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                  >
                                    Download
                                  </a>
                                )}

                                {canDelete(photo) && (
                                  <button
                                    type="button"
                                    disabled={deletingId !== null}
                                    onClick={() => handleDelete(photoId)}
                                    className="rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {String(deletingId) === String(photoId)
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Footer information */}
        <section className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🔒
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Your travel files, organized
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Only upload files you have permission to share with your trip group.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/trips/${tripId}`)}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Back to trip →
          </button>
        </section>
      </main>
    </div>
  );
};

export default Documents;