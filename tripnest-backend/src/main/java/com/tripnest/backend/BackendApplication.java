package com.tripnest.backend;

import com.tripnest.backend.entity.Destination;
import com.tripnest.backend.entity.Role;
import com.tripnest.backend.repository.DestinationRepository;
import com.tripnest.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@RequiredArgsConstructor
@EnableScheduling
@EnableAsync
public class BackendApplication implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DestinationRepository destinationRepository;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Override
    public void run(String... args) {

        // Roles seed karo
        for (Role.RoleName name : Role.RoleName.values()) {
            if (roleRepository.findByRoleName(name).isEmpty()) {
                Role role = new Role();
                role.setRoleName(name);
                roleRepository.save(role);
            }
        }
        System.out.println("✅ Roles seeded!");

        // Destinations seed karo
        if (destinationRepository.count() == 0) {
            destinationRepository.save(Destination.builder()
                .name("Goa")
                .country("India")
                .description("Famous beach destination with vibrant " +
                    "nightlife, water sports, and Portuguese heritage.")
                .bestTimeToVisit("November to February")
                .isPopular(true)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Manali")
                .country("India")
                .description("Scenic hill station in Himachal Pradesh " +
                    "known for snow, adventure sports and Rohtang Pass.")
                .bestTimeToVisit("October to June")
                .isPopular(true)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Rajasthan")
                .country("India")
                .description("Land of kings with magnificent forts, " +
                    "palaces, and rich cultural heritage.")
                .bestTimeToVisit("October to March")
                .isPopular(true)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Kerala")
                .country("India")
                .description("God's own country — backwaters, " +
                    "beaches, tea gardens and Ayurveda.")
                .bestTimeToVisit("September to March")
                .isPopular(true)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Ladakh")
                .country("India")
                .description("High altitude desert with stunning " +
                    "landscapes, monasteries and Pangong Lake.")
                .bestTimeToVisit("June to September")
                .isPopular(true)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Agra")
                .country("India")
                .description("Home to the iconic Taj Mahal, " +
                    "Agra Fort and Fatehpur Sikri.")
                .bestTimeToVisit("October to March")
                .isPopular(true)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Shimla")
                .country("India")
                .description("Queen of hills — colonial architecture, " +
                    "Mall Road and snow-capped mountains.")
                .bestTimeToVisit("March to June")
                .isPopular(false)
                .build());

            destinationRepository.save(Destination.builder()
                .name("Varanasi")
                .country("India")
                .description("One of the world's oldest cities — " +
                    "ghats, temples and spiritual experiences.")
                .bestTimeToVisit("October to March")
                .isPopular(false)
                .build());

            System.out.println("✅ Destinations seeded!");
        }
    }
}