# PasswordManager

Welcome to the Project PasswordManager! Check out the live demo below:

<p align="center">
  <a href="https://passman.sathvik.dev" target="_blank">
    <img src="https://via.placeholder.com/300x80/4CAF50/FFFFFF?text=Go+to+Live+Demo&size=30&bold=true" alt="Live Demo">
  </a>
</p>

## Access the Demo

To access the demo, use the following credentials:

- **Username:** `tajiseb284@furnato.com`
- **Password:** `Tajiseb284@furnato.com`
- **Encryption Password:** `root`


## Description

This is a secure password manager website where users can store multiple records of passwords along with other relevant information such as icons, titles, usernames, URLs, notes and attachments. The website ensures security through various measures including user authentication via email, encryption/decryption of data using AES-256, and a second password for additional security.


https://github.com/Sathvik-Rao/PasswordManager/assets/36164509/caebc373-a5fa-48be-9cd2-9ff1cdda3b15



### Running the Application

To run the application, use the following command:

```bash
docker-compose up
```

This command will start the application using Docker Compose.


## Features

- User authentication via email with OTP verification.
- Two-step account creation process involving a second password for encryption/decryption.
- Ability to reset account password using email verification.
- Encryption/Decryption of data on the user side with AES-256.
- Secure storage of encrypted data on the server.


## Security Measures

- **User Authentication**: Users are authenticated via email with OTP verification.
- **Two-Step Account Creation**: Users need to set a second password for encryption/decryption during account creation.
- **Password Encryption/Decryption**: Data is encrypted/decrypted using AES-256 on the client-side, with the encryption password not stored on the server.
- **Secure Data Storage**: Encrypted data is securely stored on the server, ensuring that even if the server is compromised, the data remains inaccessible.

## Usage

1. **Account Creation**: Users create an account with their email and receive an OTP for verification. They then set a second password for encryption/decryption.
2. **Login**: Users log in using their email and account password (second password).
3. **Password Management**: Users can store multiple records of passwords along with icons, titles, usernames, URLs, and notes.
4. **Password Recovery**: In case of forgotten account password, users can reset it via email verification.

## Note

- **Encryption/Decryption Password**: The encryption/decryption password is crucial for accessing stored data. It is not stored on the server, so if forgotten, there is no way to recover the data.


## Configuration Changes

Make sure to apply these changes accordingly to the respective files for proper configuration.

### `docker-compose.yml`

```yaml
MYSQL_ROOT_PASSWORD: [Your MySQL Root Password]
MYSQL_PASSWORD: [Your MySQL Password]
EMAIL_FROM: [Your Backend Email Address]
REPLY_TO: [Reply Tp Email Address]
```

### `html/URL.txt` (Not required for testing)

Please update the `URL.txt` file with your website URL.

### `apache2.conf` (Not required for testing)

In the `apache2.conf` file, ensure that the `ServerName` directive is set to your website's domain. For example:

```apache
ServerName yourdomain.com
```

### `msmtprc`

The `msmtprc` file is used by the server to send emails. Below is an example configuration for Gmail. Please note that for Gmail accounts with two-step verification enabled, you need to generate an app password (14 characters long) instead of using the normal password:

```ini
# Configuration for sending emails via Gmail
host smtp.gmail.com
port 587
user from@email.com
password YourAppPassword
from from@email.com
```

Replace `YourAppPassword` with the generated app password for Gmail.

Replace `from@email.com` with the your backend email address.


## Security Disclaimer

While every effort has been made to ensure the security of the website and user data, it's essential to acknowledge that no system is entirely foolproof. Users are advised to utilize strong, unique passwords and exercise caution when storing sensitive information. This being the inaugural version of the website, it may harbor undiscovered vulnerabilities.
