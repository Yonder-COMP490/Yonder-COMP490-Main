/*This is intended to bea  scrip to run one time to create the tables for the database. Should the database be lost, this could be used to set it up again(tables, not contents.) */

/*Open pgAdmin and connect to the PostgreSQL server. (if still locallly hosted)
Select the database Yonder(create if you dont have it). 
Right click on the database and select "Open Query Tool".
Open init.sql in the Query Tool and execute it (usually with F5.)*/

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users ( -- if not exists prevents that running the set up overwrites the current table if it already exists.
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 2. Create the ContactInfo table (Linked to Users via Foreign Key)
CREATE TABLE IF NOT EXISTS contact_info (
    contact_id SERIAL PRIMARY KEY, 
    phone_number VARCHAR(15),
    user_id INT NOT NULL, --User id, as a foreign key. One-to-many relationship, one user can have many contact info entries, but each contact info entry belongs to one user.
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE 
);

-- 3. Create Profiles Table (Linked to Users via Foreign Key)
CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY, 
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(512), -- Assuming a URL for the avatar image, adjust length as needed. Avatar doesnt have to be stored in the database, we certanly didnt do that for the 380 project i was on(Bartle).
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --Self explanatory, saves the date the profile was created.
    --updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --this will need a database trigger to be updated, so for now it will be greyed out so we remember that it is here.
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE -- no need for a new id for the profile since its a 1-to-1 relationship, so we can use the same user id and link em together. ON DELETE CASCADE is a little extra so if the user is deleted so is the profile.(No orphans)
);
