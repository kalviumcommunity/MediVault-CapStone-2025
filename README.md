# Capstone Project Idea: Medical Inventory Management System  

## Project Brief  

**Title:** Medical Inventory Management System  

**Objective:** To develop a web-based application that helps hospitals, clinics, and pharmacies efficiently manage their medical inventory.  

## Problem Statement  
Managing medical inventory is a crucial task for healthcare institutions. Ensuring that medicines and equipment are always in stock, monitoring expiry dates, and avoiding wastage can be challenging without an organized system. Manual tracking often leads to errors, resulting in financial losses and, more importantly, risks to patient safety.  

## Proposed Solution  
This project aims to create a streamlined and user-friendly Medical Inventory Management System that simplifies inventory tracking and ensures smooth operations for healthcare providers. The system will provide real-time stock updates, send expiry notifications, and automate restocking reminders, helping institutions efficiently manage their resources.  

## Key Features  
- Secure user authentication with role-based access (Admin, Staff, Pharmacists)  
- Real-time tracking of stock levels and inventory movement  
- Alerts for expired or soon-to-expire medicines  
- Automated reminders for low-stock items  
- A dashboard with useful insights and analytics  

## Technology Stack  
To ensure a robust and scalable system, the project will be developed using:  
- **Frontend:** React with Tailwind CSS for a clean and intuitive user experience  
- **Backend:** Node.js and Express.js to handle API requests efficiently  
- **Database:** MongoDB for flexible and scalable data storage  
- **Authentication:** JWT-based authentication for security  

## Development Plan (Completion in 1.5 Months)  
The project will be completed within a span of six weeks, with each phase focusing on a core aspect of the system:  

- **Week 1:** Setting up the authentication system, including login and sign-up pages.  
- **Week 2:** Designing and implementing the database structure to store inventory and user information.  
- **Week 3:** Building the home page with real-time stock updates and alerts.  
- **Week 4:** Developing the stock management table where users can add, update, and track inventory.  
- **Week 5:** Creating a profile management section for users to update their details and roles.  
- **Final Phase:** Testing the system thoroughly, refining the UI/UX, and making necessary optimizations before deployment.  

This structured approach ensures steady progress and allows for testing and refinements at each stage. By the end of the development period, the system will be fully functional, addressing the core problems faced in medical inventory management. Additional features or improvements can be made based on feedback and real-world testing.  





# GET All Users API

**Endpoint:**  
`GET /api/all`

**File Path:**  
`Backend/src/route/user.js`

## Description
This API endpoint retrieves and returns data for all registered users in the database. It is intended for administrative purposes or for displaying a list of users in the frontend interface.








# POST User APIs

**File Path:**  
`Backend/src/route/user.js`

This document describes the two POST API endpoints related to user authentication:

---

## 1. Sign-Up API

**Endpoint:**  
`POST /api/Sign-Up`

### Description
Registers a new user by storing their credentials and account information in the database.


## 2. Login API

**Endpoint:**  
`POST /api/Login`

### Description
Data is sent to the backend, backend verifies the data with the database.









# PUT Update Stock API

**Endpoint:**  
`PUT /api-stock/create`

**File Path:**  
`Backend/src/route/stock.js`

## Description
This API endpoint updates the stock for a specific user by adding new items to the user's existing stock. It requires the user's email and an array of stock items to be provided in the request body.




# Deployed Backend Server 

**Render Link is been Deployed here:**
https://medivault-capstone-2025.onrender.com











# Database schema created



**File Path:**  
`Backend/src/schema/StockSchema.js`
`Backend/src/schema/billModel.js`
`Backend/src/schema/userModel.js`

## Description
In this assignment we have created 3 schemas one for the user creaditial other 2 for stock and bills respectively in Backend folder.










# Database Read and Write

**File Path:**  
`Backend/src/route/user.js`


## Description
In this assignment we have reading and writing in MOngoDB database using api calls like post and get requests.

Get api call :- we are using the get for retriving all the data in the database
Post api call :- we are using the post api call for adding the user credetials to the database





# Database Read and Write

**Vecels Link:**  
`https://cap-stone-2025.vercel.app/`


## Description
In this assignment we have to deploy our frontend in netlify or vercels.





# Creating frontend component in react

**File Path:**  
`Frontend/src/components`


## Description
In this assignment we have to create frontend components like login page, home page etc. In components folder I have css, jsx, redux, privateRoute. I have completed my frontend part of this assignment

 