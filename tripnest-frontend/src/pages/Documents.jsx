import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    tripAPI,
    itineraryAPI,
    itineraryFileAPI,
} from "../utils/api";

const Documents = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [itineraries, setItineraries] = useState([]);

    const [selectedDay, setSelectedDay] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState("DOCUMENT");

    const [documents, setDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // LOAD TRIP + ITINERARIES + DOCUMENTS
    // =========================================================

    useEffect(() => {
        loadData();
    }, [tripId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [tripResponse, itineraryResponse] =
                await Promise.all([
                    tripAPI.getById(tripId),
                    itineraryAPI.getByTrip(tripId),
                ]);

            setTrip(tripResponse.data);

            const days = itineraryResponse.data || [];

            setItineraries(days);

            if (days.length > 0) {
                const firstDayId = String(days[0].id);

                setSelectedDay(firstDayId);

                await loadDocumentsForAllDays(days);
            } else {
                setDocuments([]);
            }

        } catch (err) {
            console.error(
                "Documents page loading error:",
                err.response?.data || err
            );

            setError(
                "Unable to load trip documents."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD DOCUMENTS FOR ALL ITINERARY DAYS
    // =========================================================

    const loadDocumentsForAllDays = async (days) => {
        try {
            const results = await Promise.all(
                days.map(async (day) => {
                    try {
                        const response =
                            await itineraryFileAPI.getByItinerary(
                                day.id
                            );

                        return (response.data || []).map((file) => ({
                            ...file,
                            dayNumber: day.dayNumber,
                            itineraryDate:
                                day.date ||
                                day.itineraryDate ||
                                "",
                        }));

                    } catch (err) {
                        console.error(
                            `Failed to load documents for itinerary ${day.id}:`,
                            err.response?.data || err
                        );

                        return [];
                    }
                })
            );

            const allDocuments = results.flat();

            setDocuments(allDocuments);

        } catch (err) {
            console.error(
                "Failed to load documents:",
                err
            );

            setDocuments([]);
        }
    };

    // =========================================================
    // FILE SELECT
    // =========================================================

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setMessage("");
        setError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        // 10 MB limit
        if (file.size > 10 * 1024 * 1024) {
            setSelectedFile(null);

            setError(
                "File size must be less than 10 MB."
            );

            return;
        }

        setSelectedFile(file);
    };

    // =========================================================
    // UPLOAD FILE
    // =========================================================

    const handleUpload = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!selectedFile) {
            setError(
                "Please select a file first."
            );
            return;
        }

        if (!selectedDay) {
            setError(
                "Please select an itinerary day."
            );
            return;
        }

        try {
            setUploading(true);

            // Create multipart form data
            const formData = new FormData();

            formData.append(
                "file",
                selectedFile
            );

            console.log(
                "Uploading file:",
                selectedFile.name
            );

            console.log(
                "Itinerary ID:",
                selectedDay
            );

            // Send file to Spring Boot
            const response =
                await itineraryFileAPI.upload(
                    selectedDay,
                    formData
                );

            console.log(
                "Upload response:",
                response.data
            );

            setMessage(
                `File "${selectedFile.name}" uploaded successfully.`
            );

            // Clear selected file
            setSelectedFile(null);

            // Reset file input
            const fileInput =
                document.getElementById(
                    "document-file-input"
                );

            if (fileInput) {
                fileInput.value = "";
            }

            // Reload documents
            await loadDocumentsForAllDays(
                itineraries
            );

        } catch (err) {
            console.error(
                "UPLOAD ERROR:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            if (err.response?.status === 400) {
                setError(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Invalid file upload."
                );
            } else if (err.response?.status === 404) {
                setError(
                    "Itinerary not found."
                );
            } else if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You are not authorized to upload this file."
                );
            } else {
                setError(
                    "File upload failed. Please check whether the Spring Boot backend is running."
                );
            }

        } finally {
            setUploading(false);
        }
    };

    // =========================================================
    // DELETE DOCUMENT
    // =========================================================

    const handleDelete = async (documentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await itineraryFileAPI.delete(
                documentId
            );

            setMessage(
                "Document deleted successfully."
            );

            await loadDocumentsForAllDays(
                itineraries
            );

        } catch (err) {
            console.error(
                "DELETE DOCUMENT ERROR:",
                err.response?.data || err
            );

            setError(
                "Failed to delete document."
            );
        }
    };

    // =========================================================
    // OPEN DOCUMENT
    // =========================================================

    const handleOpenDocument = (fileUrl) => {
        if (!fileUrl) {
            return;
        }

        const fullUrl =
            fileUrl.startsWith("http")
                ? fileUrl
                : `http://localhost:8080${fileUrl}`;

        window.open(
            fullUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================================================
    // FORMAT FILE SIZE
    // =========================================================

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "Unknown size";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // =========================================================
    // FILE ICON
    // =========================================================

    const getFileIcon = (contentType, fileName) => {
        const type =
            contentType ||
            "";

        const name =
            fileName ||
            "";

        if (type.includes("pdf") ||
            name.toLowerCase().endsWith(".pdf")) {
            return "📕";
        }

        if (
            type.includes("image") ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(name)
        ) {
            return "🖼️";
        }

        if (
            type.includes("word") ||
            /\.(doc|docx)$/i.test(name)
        ) {
            return "📘";
        }

        return "📄";
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="flex justify-center items-center h-96">
                    <p className="text-gray-500">
                        Loading documents...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-gray-50">

            <Navbar />

            <div className="max-w-5xl mx-auto px-6 pt-28 pb-12">

                {/* BACK BUTTON */}

                <button
                    onClick={() =>
                        navigate(`/trips/${tripId}`)
                    }
                    className="mb-6 text-sm text-gray-500 hover:text-blue-600"
                >
                    ← Back to Trip
                </button>

                {/* HEADER */}

                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">

                    <div className="flex items-start justify-between">

                        <div>

                            <h1 className="text-2xl font-bold text-gray-900">
                                Travel Documents
                            </h1>

                            <p className="text-gray-500 mt-1">
                                {trip?.title ||
                                    trip?.name ||
                                    "Trip"}
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                                📍{" "}
                                {trip?.destination ||
                                    "Destination"}
                            </p>

                        </div>

                        <div className="text-4xl">
                            📁
                        </div>

                    </div>

                </div>

                {/* UPLOAD CARD */}

                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Upload a Document
                    </h2>

                    <p className="text-sm text-gray-500 mt-1 mb-6">
                        Store your tickets, hotel bookings,
                        travel documents and other trip files.
                    </p>

                    <form onSubmit={handleUpload}>

                        {/* ITINERARY DAY */}

                        <div className="mb-5">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Itinerary Day
                            </label>

                            {itineraries.length > 0 ? (

                                <select
                                    value={selectedDay}
                                    onChange={(e) => {
                                        setSelectedDay(
                                            e.target.value
                                        );

                                        setMessage("");
                                        setError("");
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    {itineraries.map(
                                        (day) => (
                                            <option
                                                key={day.id}
                                                value={String(
                                                    day.id
                                                )}
                                            >
                                                Day{" "}
                                                {day.dayNumber}
                                                {day.date
                                                    ? ` - ${day.date}`
                                                    : ""}
                                            </option>
                                        )
                                    )}

                                </select>

                            ) : (

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                                    No itinerary days are
                                    available for this trip.
                                </div>

                            )}

                        </div>

                        {/* DOCUMENT TYPE */}

                        <div className="mb-5">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Type
                            </label>

                            <select
                                value={documentType}
                                onChange={(e) =>
                                    setDocumentType(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >

                                <option value="DOCUMENT">
                                    📄 Travel Document
                                </option>

                                <option value="TICKET">
                                    🎫 Ticket
                                </option>

                                <option value="HOTEL">
                                    🏨 Hotel Booking
                                </option>

                                <option value="PHOTO">
                                    📷 Travel Photo
                                </option>

                                <option value="OTHER">
                                    📁 Other
                                </option>

                            </select>

                        </div>

                        {/* FILE */}

                        <div className="mb-5">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select File
                            </label>

                            <input
                                id="document-file-input"
                                type="file"
                                onChange={
                                    handleFileChange
                                }
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white"
                            />

                            {selectedFile && (

                                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4">

                                    <p className="text-sm font-medium text-blue-900">
                                        📎{" "}
                                        {selectedFile.name}
                                    </p>

                                    <p className="text-xs text-blue-600 mt-1">
                                        {formatFileSize(
                                            selectedFile.size
                                        )}
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* SUCCESS */}

                        {message && (

                            <div className="mb-5 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                                ✅ {message}
                            </div>

                        )}

                        {/* ERROR */}

                        {error && (

                            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                                ❌ {error}
                            </div>

                        )}

                        {/* BUTTONS */}

                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/trips/${tripId}`
                                    )
                                }
                                className="flex-1 border border-gray-200 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    uploading ||
                                    !selectedFile ||
                                    !selectedDay
                                }
                                className={`flex-1 rounded-lg py-3 text-sm font-medium text-white ${uploading ||
                                        !selectedFile ||
                                        !selectedDay
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {uploading
                                    ? "⏳ Uploading..."
                                    : "📤 Upload File"}
                            </button>

                        </div>

                    </form>

                </div>

                {/* DOCUMENT LIST */}

                <div className="bg-white rounded-2xl border border-gray-100 p-6">

                    <div className="flex justify-between items-center">

                        <div>

                            <h2 className="text-lg font-semibold text-gray-900">
                                Trip Documents
                            </h2>

                            <p className="text-sm text-gray-400 mt-1">
                                {documents.length}{" "}
                                {documents.length === 1
                                    ? "document"
                                    : "documents"}{" "}
                                uploaded
                            </p>

                        </div>

                        <div className="text-3xl">
                            📂
                        </div>

                    </div>

                    {documents.length === 0 ? (

                        <div className="mt-6 text-center py-10">

                            <div className="text-5xl mb-3">
                                📂
                            </div>

                            <p className="text-gray-600 font-medium">
                                No documents uploaded yet
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                                Upload tickets, hotel bookings
                                and travel documents for this trip.
                            </p>

                        </div>

                    ) : (

                        <div className="mt-6 space-y-3">

                            {documents.map((file) => (

                                <div
                                    key={file.id}
                                    className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition"
                                >

                                    <div className="flex items-center justify-between gap-4">

                                        <div className="flex items-center gap-4 min-w-0">

                                            <div className="text-3xl">
                                                {getFileIcon(
                                                    file.contentType,
                                                    file.fileName
                                                )}
                                            </div>

                                            <div className="min-w-0">

                                                <p className="font-medium text-gray-800 truncate">
                                                    {file.fileName}
                                                </p>

                                                <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">

                                                    <span>
                                                        Day{" "}
                                                        {file.dayNumber}
                                                    </span>

                                                    <span>
                                                        •
                                                    </span>

                                                    <span>
                                                        {formatFileSize(
                                                            file.sizeInBytes
                                                        )}
                                                    </span>

                                                    {file.contentType && (
                                                        <>
                                                            <span>
                                                                •
                                                            </span>

                                                            <span>
                                                                {
                                                                    file.contentType
                                                                }
                                                            </span>
                                                        </>
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                        <div className="flex gap-2 shrink-0">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenDocument(
                                                        file.fileUrl
                                                    )
                                                }
                                                className="px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                                            >
                                                Open
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        file.id
                                                    )
                                                }
                                                className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default Documents;