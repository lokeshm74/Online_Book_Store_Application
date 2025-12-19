package com.bookstore.controller;

import org.springframework.web.bind.annotation.*;
import com.bookstore.entity.book;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    // Get all books grouped by category
    @GetMapping
    public Map<String, List<book>> getBooksByCategory(@RequestParam(required = false) String sort) {
        List<book> allBooks = bookRepository.findAll();
        
        // Sort if requested
        if ("asc".equalsIgnoreCase(sort)) {
            allBooks.sort((b1, b2) -> Double.compare(b1.getPrice(), b2.getPrice()));
        } else if ("desc".equalsIgnoreCase(sort)) {
            allBooks.sort((b1, b2) -> Double.compare(b2.getPrice(), b1.getPrice()));
        }
        
        // Group books by their first category
        Map<String, List<book>> booksByCategory = new HashMap<>();
        
        for (book book : allBooks) {
            if (book.getCategories() != null && !book.getCategories().isEmpty()) {
                String firstCategory = book.getCategories().get(0); // Use first category
                booksByCategory.computeIfAbsent(firstCategory, k -> new ArrayList<>()).add(book);
            } else {
                // Books without category go to "Other"
                booksByCategory.computeIfAbsent("Other", k -> new ArrayList<>()).add(book);
            }
        }
        
        return booksByCategory;
    }
    @GetMapping("/recommended")
    public List<book> getRecommendedBooks(@RequestParam String title) {
        try {
            // 1. Find the book by title
            book currentBook = bookRepository.findByTitle(title);
            
            if (currentBook == null) {
                System.out.println("Book not found: " + title);
                return List.of(); // Return empty list if book not found
            }
            
            // 2. Get all books from database
            List<book> allBooks = bookRepository.findAll();
            
            System.out.println("Current book: " + currentBook.getTitle());
            System.out.println("Current book categories: " + currentBook.getCategories());
            System.out.println("Total books in DB: " + allBooks.size());
            
            // 3. Filter books with similar categories (excluding current book)
            List<book> recommendedBooks = allBooks.stream()
                .filter(book -> !book.getTitle().equals(title)) // Exclude current book
                .filter(book -> hasCommonCategories(book, currentBook))
                .limit(4) // Return max 4 recommended books
                .collect(Collectors.toList());
                
            System.out.println("Recommended books found: " + recommendedBooks.size());
            return recommendedBooks;
            
        } catch (Exception e) {
            System.err.println("Error in getRecommendedBooks: " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Return empty list on error
        }
    }
    
    // Helper method to check for common categories
    private boolean hasCommonCategories(book book1, book book2) {
        if (book1.getCategories() == null || book2.getCategories() == null) {
            return false;
        }
        
        // Check if they share at least one category
        boolean hasCommon = book1.getCategories().stream()
            .anyMatch(category -> book2.getCategories().contains(category));
            
        return hasCommon;
    }
}