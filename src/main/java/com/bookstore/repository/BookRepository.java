package com.bookstore.repository;

import com.bookstore.entity.book;

import org.springframework.data.jpa.repository.JpaRepository;


public interface BookRepository extends JpaRepository<book, Long> {
    
    // Find book by title
    book findByTitle(String title);
    
   
}