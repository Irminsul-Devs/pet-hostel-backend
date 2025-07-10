CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  dob DATE,
  address TEXT,
  role ENUM('staff', 'admin', 'customer') NOT NULL DEFAULT 'customer',
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_date DATE NOT NULL,
  remarks TEXT,
  pet_name VARCHAR(255) NOT NULL,
  pet_type VARCHAR(50) NOT NULL,
  booking_from DATE NOT NULL,
  booking_to DATE NOT NULL,
  services JSON NOT NULL,
  pet_dob DATE NOT NULL,
  pet_age VARCHAR(20),
  pet_food TEXT NOT NULL,
  vaccination_certificate MEDIUMTEXT,
  pet_vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  amount DECIMAL(10, 2) DEFAULT 0.0,
  user_id INT NOT NULL,
  customer_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES users(id)
);