# PeraWave

This is a web-based community platform designed for students of the University of Peradeniya, covering all nine faculties. The purpose of the system is to improve communication, knowledge sharing, and community interaction among students by providing a centralized digital space for discussions related to academic, non-academic, and common university matters.


## Overview

This project is a modern full-stack application designed with:

* Responsive frontend using React
* RESTful backend with Node.js & Express
* PostgreSQL relational database
* Secure authentication with JWT
* Password hashing using bcrypt

## Tech Stack

### Frontend

* React
* HTML5 / CSS3
* JavaScript (ES6+)

### Backend

* Node.js
* Express.js
* REST API Architecture

### Database

* PostgreSQL

### Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt (Password Hashing)

### Tools

* Git & GitHub
* Postman (API Testing)


## Authentication Flow

1. User registers → password hashed using bcrypt
2. User logs in → server generates JWT
3. JWT stored on client
4. Protected routes verify JWT via middleware
