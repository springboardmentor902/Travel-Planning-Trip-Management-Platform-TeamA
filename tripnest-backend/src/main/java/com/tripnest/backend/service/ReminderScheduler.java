package com.tripnest.backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.entity.Notification;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.repository.ActivityRepository;
import com.tripnest.backend.repository.TripRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    // ============================================================
    // TRIP REMINDERS — Har din 9 AM
    // ============================================================

    @Scheduled(cron = "0 0 9 * * *")
    public void sendTripReminders() {
        log.info("Running trip reminder scheduler...");

        LocalDate today = LocalDate.now();

        List<Trip> allTrips = tripRepository.findAll();

        for (Trip trip : allTrips) {
            if (trip.getStartDate() == null) continue;
            if (trip.getStatus() == Trip.TripStatus.COMPLETED
                    || trip.getStatus()
                            == Trip.TripStatus.CANCELLED) {
                continue;
            }

            long daysLeft = ChronoUnit.DAYS.between(
                    today, trip.getStartDate());

            // 3 din pehle aur 1 din pehle reminder
            if (daysLeft == 3 || daysLeft == 1) {

                notificationService.createNotification(
                        trip.getUser(),
                        "✈️ Your trip \""
                                + trip.getTitle()
                                + "\" to "
                                + trip.getDestination()
                                + " starts in "
                                + daysLeft + " day(s)!",
                        Notification.NotificationType
                                .TRIP_REMINDER,
                        trip.getId(),
                        Notification.ReferenceType.TRIP
                );

                // Email bhi bhejo
                emailService.sendTripReminderEmail(
                        trip.getUser().getEmail(),
                        trip.getUser().getName(),
                        trip.getTitle(),
                        trip.getDestination(),
                        trip.getStartDate().toString(),
                        daysLeft
                );

                log.info("Trip reminder sent: {} — {} day(s)",
                        trip.getTitle(), daysLeft);
            }
        }
    }

    // ============================================================
    // ACTIVITY REMINDERS — Har din 8 AM
    // ============================================================

    @Scheduled(cron = "0 0 8 * * *")
    public void sendActivityReminders() {
        log.info("Running activity reminder scheduler...");

        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDate today    = LocalDate.now();

        List<Activity> allActivities =
                activityRepository.findAll();

        for (Activity activity : allActivities) {
            if (activity.getItinerary() == null) continue;
            if (activity.getItinerary().getDate() == null) {
                continue;
            }

            LocalDate activityDate =
                    activity.getItinerary().getDate();
            Trip trip = activity.getItinerary().getTrip();
            if (trip == null) continue;

            // Aaj ya kal ki activity ke liye remind karo
            if (activityDate.equals(today)
                    || activityDate.equals(tomorrow)) {

                String when = activityDate.equals(today)
                        ? "today" : "tomorrow";

                notificationService.createNotification(
                        trip.getUser(),
                        "🗓️ Activity reminder: \""
                                + activity.getTitle()
                                + "\" is scheduled "
                                + when
                                + (activity.getStartTime() != null
                                    ? " at " + activity
                                            .getStartTime()
                                    : "")
                                + " — " + trip.getTitle(),
                        Notification.NotificationType
                                .ACTIVITY_REMINDER,
                        trip.getId(),
                        Notification.ReferenceType.TRIP
                );

                // Email bhi bhejo
                emailService.sendActivityReminderEmail(
                        trip.getUser().getEmail(),
                        trip.getUser().getName(),
                        activity.getTitle(),
                        trip.getTitle(),
                        activityDate.toString()
                );

                log.info("Activity reminder sent: {}",
                        activity.getTitle());
            }
        }
    }
}