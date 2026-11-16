
package com.pictora.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/db-test")
    public String testDatabase() {
        String result = jdbcTemplate.queryForObject("SELECT version()", String.class);
        return "PostgreSQL connection successful: " + result;
    }
}
