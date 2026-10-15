package com.tripnest.backend.service;

import com.tripnest.backend.dto.ItineraryRequest;
import com.tripnest.backend.dto.ItineraryResponse;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.GroupMemberRepository;
import com.tripnest.backend.repository.ItineraryRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository; // ✅ Added

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ Owner ONLY — create/delete/generate ke liye
    private Trip verifyTripOwner(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        if (!trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        return trip;
    }

    // ✅ Owner + Member — read/update ke liye
    private Trip verifyTripAccess(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        boolean isOwner = trip.getUser().getId().equals(user.getId());
        boolean isMember = groupMemberRepository
                .isTripMember(tripId, user.getId());

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied");
        }
        return trip;
    }

    // ============================================================
    // CREATE — Only owner
    // ============================================================

    public ItineraryResponse createItinerary(Long tripId,
                                              ItineraryRequest request) {
        Trip trip = verifyTripOwner(tripId); // ✅ Owner only

        boolean exists = itineraryRepository
                .findByTripId(tripId)
                .stream()
                .anyMatch(i -> i.getDayNumber()
                        .equals(request.getDayNumber()));

        if (exists) {
            throw new RuntimeException(
                "Day " + request.getDayNumber() + " already exists!");
        }

        Itinerary itinerary = Itinerary.builder()
                .dayNumber(request.getDayNumber())
                .date(request.getDate())
                .notes(request.getNotes())
                .trip(trip)
                .build();

        return ItineraryResponse.fromEntity(
                itineraryRepository.save(itinerary));
    }

    // ============================================================
    // GET ALL — Owner + Member
    // ============================================================

    public List<ItineraryResponse> getItinerariesByTrip(Long tripId) {
        verifyTripAccess(tripId); // ✅ Member bhi dekh sakta hai

        return itineraryRepository.findByTripId(tripId)
                .stream()
                .sorted((a, b) -> a.getDayNumber()
                        .compareTo(b.getDayNumber()))
                .map(ItineraryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET ONE — Owner + Member
    // ============================================================

    public ItineraryResponse getItineraryById(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Itinerary not found"));
        verifyTripAccess(itinerary.getTrip().getId()); // ✅ Member bhi dekh sakta hai
        return ItineraryResponse.fromEntity(itinerary);
    }

    // ============================================================
    // UPDATE — Owner + Member
    // ============================================================

    public ItineraryResponse updateItinerary(Long id,
                                              ItineraryRequest request) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Itinerary not found"));
        verifyTripAccess(itinerary.getTrip().getId()); // ✅ Member bhi update kar sakta hai

        itinerary.setDayNumber(request.getDayNumber());
        itinerary.setDate(request.getDate());
        itinerary.setNotes(request.getNotes());

        return ItineraryResponse.fromEntity(
                itineraryRepository.save(itinerary));
    }

    // ============================================================
    // DELETE — Only owner
    // ============================================================

    public void deleteItinerary(Long id) {
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Itinerary not found"));
        verifyTripOwner(itinerary.getTrip().getId()); // ✅ Owner only
        itineraryRepository.delete(itinerary);
    }

    // ============================================================
    // GENERATE DAYS — Only owner
    // ============================================================

    public List<ItineraryResponse> generateDays(Long tripId) {
        Trip trip = verifyTripOwner(tripId); // ✅ Owner only

        if (trip.getStartDate() == null || trip.getEndDate() == null) {
            throw new RuntimeException(
                    "Trip start/end date set nahi hai!");
        }

        itineraryRepository.deleteAll(
                itineraryRepository.findByTripId(tripId));

        List<Itinerary> days = new java.util.ArrayList<>();
        java.time.LocalDate current = trip.getStartDate();
        int dayNum = 1;

        while (!current.isAfter(trip.getEndDate())) {
            Itinerary day = Itinerary.builder()
                    .dayNumber(dayNum)
                    .date(current)
                    .notes("Day " + dayNum + " - "
                            + trip.getDestination())
                    .trip(trip)
                    .build();
            days.add(day);
            current = current.plusDays(1);
            dayNum++;
        }

        return itineraryRepository.saveAll(days)
                .stream()
                .map(ItineraryResponse::fromEntity)
                .collect(Collectors.toList());
    }
}