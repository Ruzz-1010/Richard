# Fix Registration/Login Issue

## Problem
- register.html uses localStorage simulation instead of backend API
- Users register locally but database isn't updated
- Login fails because user doesn't exist in database
- Re-registering loops back to registration page

## Solution
- [ ] Update register.html to use backend API via auth.js
- [ ] Remove localStorage simulation code
- [ ] Include proper scripts (config.js, auth.js)
- [ ] Update form submission logic
- [ ] Test registration and login flow

## Files to Edit
- frontend/register.html
