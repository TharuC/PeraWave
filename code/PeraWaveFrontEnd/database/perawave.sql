-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
    email VARCHAR(255) UNIQUE NOT NULL 
        CHECK (email ~ '^[A-Za-z0-9._%+-]+@[a-z]+\.pdn\.ac\.lk$'),
    faculty VARCHAR(50) NOT NULL,
    batch VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Forums table
CREATE TABLE forums (
    forum_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('university', 'faculty', 'batch')),
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    forum_id INT NOT NULL REFERENCES forums(forum_id) ON DELETE CASCADE,
    author_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reactions table (updated to allow like/heart)
CREATE TABLE reactions (
    reaction_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL 
        CHECK (type IN ('upvote', 'report', 'like', 'heart')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log table
CREATE TABLE user_activity (
    activity_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('post','reaction')),
    target_id INT NOT NULL, -- post_id or reaction_id depending on action
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);