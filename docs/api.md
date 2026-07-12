# API Documentation

This document describes the API endpoints exposed by the backend service.

## Authentication

### `POST /auth/register`
Registers a new user.

### `POST /auth/login`
Authenticates a user and returns a JWT token.

## Users

### `GET /users/me`
Returns the current authenticated user's profile.

## Posts

### `GET /posts`
Retrieves a paginated list of posts.

### `POST /posts`
Creates a new post.
