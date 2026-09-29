package com.example.buddy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.buddy.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
}