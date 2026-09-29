package com.example.buddy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.buddy.model.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}