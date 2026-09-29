package com.example.buddy.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.buddy.model.Subject;
import com.example.buddy.repository.SubjectRepository;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public Subject createSubject(Subject subject) {

        if (subject.getName() == null || subject.getName().trim().isEmpty()) {
            throw new RuntimeException("Subject name is required");
        }

        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
    }
}