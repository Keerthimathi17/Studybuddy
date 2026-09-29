package com.example.buddy.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.buddy.model.Student;
import com.example.buddy.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student createStudent(Student student) {

        if (student.getName() == null ||
            student.getName().trim().isEmpty()) {

            throw new RuntimeException("Student name is required");
        }

        if (student.getEmail() == null ||
            student.getEmail().trim().isEmpty()) {

            throw new RuntimeException("Student email is required");
        }

        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {

        return studentRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Student not found"));
    }
}