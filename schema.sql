CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  dob DATE,
  address TEXT,
  role ENUM('staff', 'admin', 'customer') NOT NULL DEFAULT 'customer'
);