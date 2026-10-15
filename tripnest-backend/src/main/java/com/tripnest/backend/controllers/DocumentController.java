package com.tripnest.backend.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tripnest.backend.dto.DocumentResponse;
import com.tripnest.backend.entity.TripDocument;
import com.tripnest.backend.service.DocumentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // POST /api/trips/{tripId}/documents — Upload
    @PostMapping(
        value = "/trips/{tripId}/documents",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<DocumentResponse> upload(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType",
                          required = false)
                TripDocument.DocumentType documentType,
            @RequestParam(value = "description",
                          required = false)
                String description)
            throws IOException {

        return ResponseEntity.ok(
                documentService.uploadDocument(
                        tripId, file,
                        documentType, description));
    }

    // GET /api/trips/{tripId}/documents — All docs
    @GetMapping("/trips/{tripId}/documents")
    public ResponseEntity<List<DocumentResponse>> getAll(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                documentService.getDocumentsByTrip(tripId));
    }

    // GET /api/trips/{tripId}/documents/photos — Photos only
    @GetMapping("/trips/{tripId}/documents/photos")
    public ResponseEntity<List<DocumentResponse>> getPhotos(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(
                documentService.getPhotosByTrip(tripId));
    }

    // GET /api/trips/{tripId}/documents/type?type=FLIGHT_TICKET
    @GetMapping("/trips/{tripId}/documents/type")
    public ResponseEntity<List<DocumentResponse>> getByType(
            @PathVariable Long tripId,
            @RequestParam TripDocument.DocumentType type) {
        return ResponseEntity.ok(
                documentService.getDocumentsByType(
                        tripId, type));
    }

    // GET /api/documents/{id}
    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentResponse> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                documentService.getDocumentById(id));
    }

    // DELETE /api/documents/{id}
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id) throws IOException {
        documentService.deleteDocument(id);
        return ResponseEntity.ok("Document deleted");
    }
}