-- ========= 1. CREATE 'Messes' TABLE =========
CREATE TABLE IF NOT EXISTS "Messes" (
    "mess_id" SERIAL PRIMARY KEY,
    "mess_block" VARCHAR(50) NOT NULL UNIQUE
);

-- ========= 2. INSERT DEFAULT MESS BLOCKS =========
INSERT INTO "Messes" (mess_block) 
VALUES 
    ('A Block'),
    ('B Block'),
    ('C Block')
ON CONFLICT (mess_block) DO NOTHING;

-- ========= 3. CREATE 'Users' TABLE =========
CREATE TABLE IF NOT EXISTS "Users" (
    "user_id" SERIAL PRIMARY KEY,
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "room_number" VARCHAR(20) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    
    "default_mess_id" INTEGER NOT NULL,
    CONSTRAINT fk_mess
        FOREIGN KEY("default_mess_id") 
        REFERENCES "Messes"("mess_id")
        ON DELETE RESTRICT
);

-- ========= 4. CREATE 'Requests' TABLE =========
CREATE TABLE IF NOT EXISTS "Requests" (
    "request_id" SERIAL PRIMARY KEY,
    "item_name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'completed'
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    "price_offered" NUMERIC(10, 2) NOT NULL,
    
    -- Foreign Key for the user who made the request
    "requester_id" INTEGER NOT NULL,
    CONSTRAINT fk_requester
        FOREIGN KEY("requester_id") 
        REFERENCES "Users"("user_id")
        ON DELETE CASCADE,
        
    -- Foreign Key for the delivery location
    "delivery_mess_id" INTEGER NOT NULL,
    CONSTRAINT fk_delivery_mess
        FOREIGN KEY("delivery_mess_id") 
        REFERENCES "Messes"("mess_id")
        ON DELETE RESTRICT,

    -- Stores the ID of the person who accepted the job
    "fulfiller_id" INTEGER NULL, 
    CONSTRAINT fk_fulfiller
        FOREIGN KEY("fulfiller_id")
        REFERENCES "Users"("user_id")
        ON DELETE SET NULL
);

-- ========= 5. VERIFY DATA =========
SELECT * FROM "Messes";