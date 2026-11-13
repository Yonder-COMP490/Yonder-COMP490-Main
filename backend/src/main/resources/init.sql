
/*
 * Module name: Database Initialization Script (init.sql)
 * Date: 11/09/2026
 * Programmer: Christian Bartle
 *
 * Description: Defines the PostgreSQL tables used by the Yonder backend:
 * users, contact_info, profiles, costs, trips, activities, budgetItem,
 * pointOfInterest, and housingBooking. This script is intended to be run once to 
 * create the tables for the database. If the database is lost, this script can be 
 * used to set it up again (tables only, not contents, that would requiere a 
 * separate backup).
 *
 * Important operations:
 * - Creates each table if it does not already exist.
 * - Defines primary keys, generated IDs, columns, and foreign-key
 *   relationships between related records.
 * - Uses ON DELETE CASCADE on selected relationships so dependent records
 *   are deleted when their referenced parent is deleted.
 *
 * Data structures: 
 * - Defines relational tables and columns for user accounts,
 *   profiles, trips, activities, costs, budget items, points of interest,
 *   housing bookings, and contact information.
 *
 */

/*This is intended to be a script to be ran one time to create the tables for the database. Should the database be lost, this could also be used to set it up again(tables, not contents.) */

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users ( -- if not exists prevents that running the set up overwrites the current table if it already exists.
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    --updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 

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
    --updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --this will need a database trigger to be updated, so for now it will be greyed out so we remember that it is here.
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE -- no need for a new id for the profile since its a 1-to-1 relationship, so we can use the same user id and link em together. ON DELETE CASCADE is a little extra so if the user is deleted so is the profile.(No orphans)
);

-- 7 create COSTs table for the COSTs object, used throught.
CREATE TABLE IF NOT EXISTS costs(
    cost_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lower_end NUMERIC(19, 4) NOT NULL,
    upper_end NUMERIC(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    CHECK (lower_end >= 0 AND upper_end >= lower_end),
    CHECK (currency ~ '^[A-Z]{3}$')
);

-- 4. Create Trips Table
CREATE TABLE IF NOT EXISTS trips (
    trip_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_name VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE, -- NOT NULL,
    preferredCurrency VARCHAR(3) NOT NULL

    --private int id;
    --private String name;
    --private LocalDate startDate;
    --private LocalDate endDate;
    --private String preferredCurrency;

    --private List<Activity> activities;  --Own tables, Groups of items
    --private List<HousingBooking> housingBookings;
    --private List<BudgetItem> budgetItems;
    
);

-- 5 Create Activities Table
CREATE TABLE IF NOT EXISTS activities (
    activity_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    activity_name VARCHAR(100),
    picture_url VARCHAR(512),

    activity_status BOOLEAN NOT NULL DEFAULT FALSE,
    tripDay INT,
    activityDate DATE, -- NOT NULL,
    
    startTime TIME,
    endTime TIME,
    
    trip_id INT NOT NULL,
    CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE, 


    cost_id BIGINT NOT NULL UNIQUE, 
    CONSTRAINT fk_cost FOREIGN KEY (cost_id) REFERENCES costs(cost_id),

    activityNotes TEXT,
    location_address TEXT,
    activity_latitude DOUBLE PRECISION,
    activity_longitude DOUBLE PRECISION

);

-- 6 create Budget Item table
CREATE TABLE IF NOT EXISTS budgetItem(
    budgetItem_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    budgetItem_name VARCHAR(100),

    trip_id INT NOT NULL,
    CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,

    
    cost_id BIGINT NOT NULL UNIQUE, 
    CONSTRAINT fk_activity_cost FOREIGN KEY (cost_id) REFERENCES costs(cost_id),

    budgetItem_days INT

);




-- 8 Create PointOfInterest table
CREATE TABLE IF NOT EXISTS pointOfInterest(
    point_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trip_id INT NOT NULL,

    CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE, 

    poi_Name VARCHAR(100),
    poi_picture_url VARCHAR(512),

    cost_id BIGINT NOT NULL UNIQUE, 
    CONSTRAINT fk_activity_cost FOREIGN KEY (cost_id) REFERENCES costs(cost_id),

    --- Might be its own table, I see repetion. 
    poi_notes TEXT,
    location_address TEXT,
    activity_latitude DOUBLE PRECISION,
    activity_longitude DOUBLE PRECISION
);

-- 9 Create housing table
CREATE TABLE IF NOT EXISTS housingBooking(
    housingBooking_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    trip_id INT NOT NULL,
    CONSTRAINT fk_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE, 

    hB_Name VARCHAR(100),
    hB_picture_url VARCHAR(512),
    
    active BOOLEAN NOT NULL DEFAULT TRUE,
    trip_day INTEGER,
    fixed_check_in_date DATE,
    check_in_time TIME,
    check_out_time TIME,
    nights INTEGER NOT NULL CHECK (nights >= 0),

    cost_id BIGINT NOT NULL UNIQUE, 
    CONSTRAINT fk_activity_cost FOREIGN KEY (cost_id) REFERENCES costs(cost_id),

    --private Cost costPerDay;

    ---More repetition
    housing_notes TEXT,
    location_address TEXT,
    activity_latitude DOUBLE PRECISION,
    activity_longitude DOUBLE PRECISION

);


