// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    hamburger.classList.toggle('active');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
                hamburger.classList.remove('active');
            }
        }
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const submitBtn = document.querySelector('.submit-btn');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to check if all required fields are filled
function checkFormValidity() {
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    // Enable button if both fields are filled and email is valid
    submitBtn.disabled = !(email && message && isValidEmail(email));
}

// Add input event listeners to required fields
emailInput.addEventListener('input', checkFormValidity);
messageInput.addEventListener('input', checkFormValidity);

// Initialize form state
document.addEventListener('DOMContentLoaded', () => {
    submitBtn.disabled = true;
});

// Function to show popup
function showPopup(message, isError = false) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup elements
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'popup';
    
    // Add icon based on status
    const iconDiv = document.createElement('div');
    iconDiv.className = 'popup-icon';
    iconDiv.innerHTML = isError 
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
           </svg>`;
    
    // Add title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'popup-title';
    titleDiv.textContent = isError ? 'Error' : 'Success';
    
    // Add message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'popup-message';
    messageDiv.textContent = message;
    
    // Add OK button
    const okButton = document.createElement('button');
    okButton.className = 'popup-button';
    okButton.textContent = 'OK';
    
    // Assemble popup
    popup.appendChild(iconDiv);
    popup.appendChild(titleDiv);
    popup.appendChild(messageDiv);
    popup.appendChild(okButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Show popup with animation
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
    
    // Handle OK button click
    okButton.addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    });
}

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent form submission
    
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    // Validate fields
    if (!email || !message) {
        showPopup('Please fill in both email and message fields.', true);
        return;
    }
    
    if (!isValidEmail(email)) {
        showPopup('Please enter a valid email address.', true);
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    const name = document.getElementById('name')?.value?.trim() || 'Anonymous';
    const subject = document.getElementById('subject')?.value?.trim() || 'Contact Form Submission';
    
    try {
        const response = await fetch('http://localhost:8080/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                subject,
                message
            }),
        });

        const responseData = await response.json();

        if (response.ok) {
            showPopup('Your message has been sent successfully. Our team will review and get back to you shortly. Thank you!');
            contactForm.reset();
        } else {
            console.error('Error from server:', responseData.error);
            showPopup(`Sorry, there was an error sending your message: ${responseData.error || 'Unknown error'}`, true);
        }
    } catch (error) {
        console.error('Network or parsing error:', error);
        showPopup('Sorry, there was an error connecting to the server. Please try again later.', true);
    } finally {
        submitBtn.textContent = 'Send Query';
        checkFormValidity();
    }
});

// Scroll Animation for Elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.service-card, .tool-card, .resource-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    observer.observe(card);
});

// Header scroll effect
const header = document.querySelector('header');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Active link highlighting
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
});

// Tool Card Hover Effect
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
        card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
    });
}); 