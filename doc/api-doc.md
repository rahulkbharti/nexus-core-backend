API Documentation for Authentication and Authorization Service

This document provides an overview of the available authentication and authorization endpoints for the Library API. The API supports multiple user roles, including Super Admin, Admin, Staff, and Member, each with specific permissions and access levels.

BASE_URL: The base URL for all endpoints should be specified by the client.

## Common Routes (Accessible by Any User)

- **POST /api/auth/:role/login**  
  Authenticate a user with the specified role.  
  **Request Body (JSON):**

  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword"
  }
  ```

- **POST /api/auth/refresh**  
  Refresh the authentication token.  
  **Request Body (JSON):**

  ```json
  {
    "refreshToken": "yourRefreshToken"
  }
  ```

- **POST /api/auth/staff/update-permissions**  
  Update permissions for a staff member.  
  _Access: Staff Only_  
  **Request Body (JSON):**

  ```json
  {
    "update_permissions": [{ "id": 2 }, { "id": 3 }],
    "userId": 6
  }
  ```

- **POST /api/auth/logout**  
  Log out the currently authenticated user.  
  **Request Body (JSON):**
  ```json
  {
    "refreshToken": "",
    "accessToken": ""
  }
  ```

## Admin Routes (Super Admin Only)

- **POST /api/auth/admin/register**  
  Register a new admin user.  
  **Request Body (JSON):**

  ```json
  {
    "email": "admin1@gmail.com",
    "password": "123456",
    "name": "Rahul Kumar Bharti4"
  }
  ```

- **GET /api/auth/admin**  
  Retrieve a list of all admin users.

- **GET /api/auth/admin/:id**  
  Retrieve details of a specific admin user by ID.

- **PUT /api/auth/admin/:id**  
  Update details of a specific admin user by ID.  
  **Request Body (JSON):**

  ```json
  {
    "email": "updated_admin@example.com",
    "name": "Updated Admin Name"
  }
  ```

- **DELETE /api/auth/admin/:id**  
  Delete a specific admin user by ID.

## Staff Routes (Admin Only)

- **POST /api/auth/staff/register**  
  Register a new staff member.  
  **Request Body (JSON):**

  ```json
  {
    "email": "staff@example.com",
    "password": "staffPassword",
    "name": "Staff Name",
    "groupId": "groupId"
  }
  ```

- **GET /api/auth/staff**  
  Retrieve a list of all staff members.

- **GET /api/auth/staff/:id**  
  Retrieve details of a specific staff member by ID.

- **PUT /api/auth/staff/:id**  
  Update details of a specific staff member by ID.  
  **Request Body (JSON):**

  ```json
  {
    "email": "updated_staff@example.com",
    "name": "Updated Staff Name",
    "groupId": "updatedGroupId"
  }
  ```

- **DELETE /api/auth/staff/:id**  
  Delete a specific staff member by ID.

## Member Routes (Admin and Staff Only)

- **POST /api/auth/member/register**  
  Register a new member.  
  **Request Body (JSON):**

  ```json
  {
    "email": "member@example.com",
    "password": "memberPassword",
    "name": "Member Name"
  }
  ```

- **GET /api/auth/member**  
  Retrieve a list of all members.

- **GET /api/auth/member/:id**  
  Retrieve details of a specific member by ID.

- **PUT /api/auth/member/:id**  
  Update details of a specific member by ID.  
  **Request Body (JSON):**

  ```json
  {
    "email": "updated_member@example.com",
    "name": "Updated Member Name"
  }
  ```

- **DELETE /api/auth/member/:id**  
  Delete a specific member by ID.

## Group Routes (Admin Only)

- **POST /api/auth/group/create**  
  Create a new user group.  
  **Request Body (JSON):**

  ```json
  {
    "name": "Group Name",
    "description": "Optional group description"
  }
  ```

- **GET /api/auth/group**  
  Retrieve a list of all groups.

- **GET /api/auth/group/:id**  
  Retrieve details of a specific group by ID.

- **PUT /api/auth/group/:id**  
  Update details of a specific group by ID.  
  **Request Body (JSON):**

  ```json
  {
    "name": "Updated Group Name",
    "description": "Updated group description"
  }
  ```

- **DELETE /api/auth/group/:id**  
  Delete a specific group by ID.

## Organization Routes (Admin Only)

- **POST /api/auth/org/create**  
  Create a new organization.  
  **Request Body (JSON):**

  ```json
  {
    "name": "Organization Name",
    "address": "Organization Address"
  }
  ```

- **GET /api/auth/org**  
  Retrieve a list of all organizations.

- **GET /api/auth/org/:id**  
  Retrieve details of a specific organization by ID.

- **PUT /api/auth/org/:id**  
  Update details of a specific organization by ID.  
  **Request Body (JSON):**

  ```json
  {
    "name": "Updated Organization Name",
    "address": "Updated Organization Address"
  }
  ```

- **DELETE /api/auth/org/:id**  
  Delete a specific organization by ID.

**Note:**

- Ensure you have the appropriate role and permissions to access each endpoint.
- All endpoints expect and return JSON unless otherwise specified.
- For secure access, use HTTPS and provide valid authentication tokens where required.
