# B.Tech Attendance Tracker — Java Spring Boot Backend

Enterprise RESTful backend service built with **Java 21** and **Spring Boot 3.3.2**.

## Structure
```
backend/
├── pom.xml
├── ARCHITECTURE.md
├── README.md
└── src/
    └── main/
        ├── java/com/btech/attendance/
        │   ├── BTechAttendanceApplication.java
        │   ├── config/
        │   │   └── OpenApiConfig.java
        │   ├── controller/
        │   │   ├── AttendanceController.java
        │   │   ├── StudentController.java
        │   │   └── TimetableController.java
        │   ├── dto/
        │   │   ├── AttendanceSummaryDTO.java
        │   │   ├── MarkAttendanceRequest.java
        │   │   └── StudentDTO.java
        │   └── service/
        │       └── AttendanceCalculationEngine.java
        └── resources/
            └── application.properties
```

## How to Run
```bash
cd backend
mvn clean spring-boot:run
```
Swagger UI will be accessible at: `http://localhost:8080/swagger-ui.html`
