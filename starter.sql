CREATE DATABASE IF NOT EXISTS password_manager;
CREATE DATABASE IF NOT EXISTS password_manager_users;
USE password_manager;
CREATE TABLE IF NOT EXISTS user_details(email varchar(256) UNIQUE NOT NULL, password varchar(64) NOT NULL, status tinyint NOT NULL, created_on bigint, last_login bigint, otp varchar(64), otp_expiry bigint, otp_failure_attempts tinyint, login_failure_attempts tinyint, capacity_in_bytes bigint NOT NULL, max_rows bigint NOT NULL, jwt_id varchar(32));
