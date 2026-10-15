package com.btech.attendance.controller;

import com.btech.attendance.dto.StudentDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@Tag(name = "Student Registration & Authentication", description = "Student profile, reg no, section, and year management")
@CrossOrigin(origins = "*")
public class StudentController {

    @PostMapping("/login")
    @Operation(summary = "Student Login / Session", description = "Authenticates student via Registration Number and Year")
    public ResponseEntity<StudentDTO> login(@RequestBody StudentDTO loginRequest) {
        // Return authenticated student payload with JWT token in production
        return ResponseEntity.ok(loginRequest);
    }

    @PostMapping("/register")
    @Operation(summary = "Register New B.Tech Student", description = "Enrolls student with Reg No, Section, and Year")
    public ResponseEntity<StudentDTO> register(@Valid @RequestBody StudentDTO student) {
        return new ResponseEntity<>(student, HttpStatus.CREATED);
    }

    @GetMapping("/{regNo}")
    @Operation(summary = "Find Student By Registration Number", description = "Lookup student profile details")
    public ResponseEntity<StudentDTO> getStudent(@PathVariable String regNo) {
        return ResponseEntity.ok(new StudentDTO(
            "std_" + regNo.toLowerCase(),
            regNo,
            "Ambika Uppu",
            "SECTION-6 (N-311)",
            2,
            4,
            "Computer Science & Engineering",
            "uppuambika@gmail.com"
        ));
    }
}
