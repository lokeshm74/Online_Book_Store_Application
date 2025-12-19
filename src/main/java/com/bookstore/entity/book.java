package com.bookstore.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "books")
public class book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String author;
    private Double price;
    private String imageUrl;
    
    // ✅ Categories field
    @ElementCollection
    private List<String> categories;
    
    // Constructors
    public book() {}
    
    public book(String title, String author, Double price, String imageUrl, List<String> categories) {
        this.title = title;
        this.author = author;
        this.price = price;
        this.imageUrl = imageUrl;
        this.categories = categories;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }
}