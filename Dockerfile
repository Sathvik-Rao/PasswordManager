FROM ubuntu

# Set non-interactive frontend for apt
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install dependencies
RUN apt-get update -y && \
    apt-get install -y \
    apache2 \
    software-properties-common \
    msmtp \
    ca-certificates 

# Install PHP 8.0 from Ondřej Surý's PPA
RUN add-apt-repository ppa:ondrej/php && \
    apt-get update -y && \
    apt-get install -y \
    php8.0 \
    php8.0-gd \
    php8.0-mbstring \
    php8.0-mysqli

# Copy website files to Apache root directory
COPY html/ /var/www/html/

# Copy Apache configuration
COPY apache2.conf /etc/apache2/apache2.conf

# Enable Apache modules
RUN a2enmod rewrite && \
    a2enmod headers

# Copy PHP configuration
COPY php.ini /etc/php/8.0/apache2/php.ini

# Copy msmtp configuration
COPY msmtprc /etc/msmtprc

# Create and set permissions for data directory
RUN mkdir -p /srv/password_manager_data && \
    chmod 0777 /srv/password_manager_data

# Start Apache
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]

# Expose port 80
EXPOSE 80
