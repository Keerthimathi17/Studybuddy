package com.example.buddy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.buddy.model.StudyGroup;

public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    List<StudyGroup> findBySubjectIgnoreCase(String subject);
}