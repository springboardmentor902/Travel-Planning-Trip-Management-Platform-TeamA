package com.tripnest.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.backend.entity.TripDocument;

public interface TripDocumentRepository
        extends JpaRepository<TripDocument, Long> {

    List<TripDocument> findByTripId(Long tripId);

    List<TripDocument> findByTripIdAndDocumentType(
            Long tripId,
            TripDocument.DocumentType documentType);

    List<TripDocument> findByUploadedById(Long userId);
}