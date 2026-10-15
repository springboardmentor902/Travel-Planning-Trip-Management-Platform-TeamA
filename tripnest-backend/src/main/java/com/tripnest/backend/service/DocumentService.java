package com.tripnest.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tripnest.backend.dto.DocumentResponse;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.TripDocument;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.GroupMemberRepository;
import com.tripnest.backend.repository.TripDocumentRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final Cloudinary cloudinary;
    private final TripDocumentRepository documentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final GroupMemberRepository groupMemberRepository;

    // ============================================================
    // CONSTANTS
    // ============================================================

    private static final long MAX_FILE_SIZE =
            10 * 1024 * 1024; // 10MB

    private static final List<String> ALLOWED_TYPES =
            Arrays.asList(
                    "image/jpeg", "image/jpg",
                    "image/png", "image/gif", "image/webp",
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-"
                    + "officedocument.wordprocessingml.document",
                    "text/plain"
            );

    // ============================================================
    // HELPERS
    // ============================================================

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // ✅ Owner + Member access
    private Trip verifyTripAccess(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        boolean isOwner = trip.getUser().getId()
                .equals(user.getId());
        boolean isMember = groupMemberRepository
                .isTripMember(tripId, user.getId());

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }
        return trip;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "File too large. Max: 10MB. Current: "
                    + String.format("%.1f MB",
                            file.getSize() / 1048576.0));
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct)) {
            throw new RuntimeException(
                    "File type not allowed: " + ct);
        }
    }

    // ============================================================
    // UPLOAD — Owner + Member
    // ============================================================

    @SuppressWarnings("unchecked")
    public DocumentResponse uploadDocument(
            Long tripId,
            MultipartFile file,
            TripDocument.DocumentType documentType,
            String description) throws IOException {

        validateFile(file);

        Trip trip = verifyTripAccess(tripId); // ✅
        User user = getCurrentUser();

        String folder  = "tripnest/trip_" + tripId;
        String publicId = folder + "/"
                + UUID.randomUUID();

        String contentType = file.getContentType();
        boolean isImage = contentType != null
                && contentType.startsWith("image/");

        Map<String, Object> options = ObjectUtils.asMap(
                "public_id",    publicId,
                "resource_type", isImage ? "image" : "raw",
                "folder",       folder
        );

        Map<String, Object> uploadResult =
                cloudinary.uploader().upload(
                        file.getBytes(), options);

        String fileUrl = (String) uploadResult
                .get("secure_url");
        String cloudinaryPublicId =
                (String) uploadResult.get("public_id");

        log.info("Uploaded to Cloudinary: {}",
                cloudinaryPublicId);

        TripDocument document = TripDocument.builder()
                .fileName(cloudinaryPublicId.substring(
                        cloudinaryPublicId
                                .lastIndexOf('/') + 1))
                .originalFileName(
                        file.getOriginalFilename())
                .cloudinaryPublicId(cloudinaryPublicId)
                .fileUrl(fileUrl)
                .fileType(contentType)
                .fileSize(file.getSize())
                .documentType(documentType != null
                        ? documentType
                        : TripDocument.DocumentType.OTHER)
                .description(description)
                .trip(trip)
                .uploadedBy(user)
                .build();

        TripDocument saved =
                documentRepository.save(document);

        // ✅ Notify all trip members
        notifyTripMembers(
                tripId,
                user,
                user.getName()
                + " uploaded: \""
                + file.getOriginalFilename()
                + "\" to trip \""
                + trip.getTitle() + "\"",
                tripId
        );

        return DocumentResponse.fromEntity(saved);
    }

    // ============================================================
    // GET ALL DOCUMENTS — Owner + Member
    // ============================================================

    public List<DocumentResponse> getDocumentsByTrip(
            Long tripId) {
        verifyTripAccess(tripId); // ✅
        return documentRepository.findByTripId(tripId)
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET BY TYPE — Owner + Member
    // ============================================================

    public List<DocumentResponse> getDocumentsByType(
            Long tripId,
            TripDocument.DocumentType type) {
        verifyTripAccess(tripId); // ✅
        return documentRepository
                .findByTripIdAndDocumentType(tripId, type)
                .stream()
                .map(DocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET PHOTOS — Owner + Member
    // ============================================================

    public List<DocumentResponse> getPhotosByTrip(
            Long tripId) {
        return getDocumentsByType(
                tripId,
                TripDocument.DocumentType.PHOTO);
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    public DocumentResponse getDocumentById(Long id) {
        TripDocument doc = documentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found"));

        // Access check
        verifyTripAccess(doc.getTrip().getId());

        return DocumentResponse.fromEntity(doc);
    }

    // ============================================================
    // DELETE — Only uploader or trip owner
    // ============================================================

    @SuppressWarnings("unchecked")
    public void deleteDocument(Long documentId)
            throws IOException {

        TripDocument doc = documentRepository
                .findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found"));

        User currentUser = getCurrentUser();
        Trip trip        = doc.getTrip();

        boolean isUploader = doc.getUploadedBy()
                .getId().equals(currentUser.getId());
        boolean isTripOwner = trip.getUser()
                .getId().equals(currentUser.getId());

        if (!isUploader && !isTripOwner) {
            throw new RuntimeException(
                    "Only uploader or trip owner can delete");
        }

        boolean isImage = doc.getFileType() != null
                && doc.getFileType().startsWith("image/");

        cloudinary.uploader().destroy(
                doc.getCloudinaryPublicId(),
                ObjectUtils.asMap(
                        "resource_type",
                        isImage ? "image" : "raw"));

        log.info("Deleted from Cloudinary: {}",
                doc.getCloudinaryPublicId());

        documentRepository.delete(doc);
    }

    // ============================================================
    // HELPER — Notify trip members
    // ============================================================

    private void notifyTripMembers(Long tripId,
                                    User currentUser,
                                    String message,
                                    Long refId) {
        try {
            groupMemberRepository
                    .findAcceptedMembersByTripId(tripId)
                    .stream()
                    .map(gm -> gm.getUser())
                    .filter(u -> !u.getId()
                            .equals(currentUser.getId()))
                    .forEach(u ->
                        notificationService
                                .createNotification(
                                u,
                                message,
                                Notification.NotificationType
                                        .SYSTEM,
                                refId,
                                Notification.ReferenceType
                                        .TRIP));
        } catch (Exception e) {
            log.warn("Notify members failed: {}",
                    e.getMessage());
        }
    }
}