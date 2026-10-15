package com.tripnest.backend.dto;

import java.time.LocalDateTime;

import com.tripnest.backend.entity.TripDocument;

import lombok.Data;

@Data
public class DocumentResponse {

    private Long id;
    private String fileName;
    private String originalFileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String fileSizeFormatted;
    private TripDocument.DocumentType documentType;
    private String description;
    private Long tripId;
    private String tripTitle;
    private String uploadedByEmail;
    private String uploadedByName;
    private LocalDateTime createdAt;
    private Boolean isPhoto;

    public static DocumentResponse fromEntity(TripDocument d) {
        DocumentResponse res = new DocumentResponse();
        res.setId(d.getId());
        res.setFileName(d.getFileName());
        res.setOriginalFileName(d.getOriginalFileName());
        res.setFileUrl(d.getFileUrl());
        res.setFileType(d.getFileType());
        res.setFileSize(d.getFileSize());
        res.setFileSizeFormatted(formatSize(d.getFileSize()));
        res.setDocumentType(d.getDocumentType());
        res.setDescription(d.getDescription());
        res.setTripId(d.getTrip().getId());
        res.setTripTitle(d.getTrip().getTitle());
        res.setUploadedByEmail(d.getUploadedBy().getEmail());
        res.setUploadedByName(d.getUploadedBy().getName());
        res.setCreatedAt(d.getCreatedAt());
        res.setIsPhoto(d.getDocumentType()
                == TripDocument.DocumentType.PHOTO);
        return res;
    }

    private static String formatSize(Long bytes) {
        if (bytes == null) return "Unknown";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576)
            return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / 1048576.0);
    }
}