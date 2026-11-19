package hr.fer.pictora.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Provides an endpoint for checking whether the backend is running.
 */
@RestController
public class HealthController {

    /**
     * Returns a simple confirmation that the backend is working.
     */
    @GetMapping("/api/health")
    public String health() {
        return "Pictora backend is running!";
    }
}
