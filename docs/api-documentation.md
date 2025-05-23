# Robotics Tournament API Documentation

## Overview

This API provides endpoints for managing robotics tournaments, including users, teams, tournaments, stages, and matches. The API follows RESTful principles and uses JSON for data exchange.

**Base URL**: `http://localhost:3000/api`

**API Documentation**: `/api/docs` (Swagger UI)

## Authentication

The API uses JWT (JSON Web Token) based authentication to secure endpoints and implement role-based access control.

### Authentication Flow

1. Register a user account or use the default admin account
2. Login with your credentials to receive a JWT token
3. Include this token in subsequent requests as a Bearer token in the Authorization header

### Default Admin Account

For initial setup, a default admin account is automatically created when the application starts:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

It's recommended to change the admin password after first login for security purposes.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |
| GET | `/auth/init-admin` | Initialize default admin (only needed if admin account is missing) |
| GET | `/auth/check-auth` | Check if authentication is working (requires token) |
| GET | `/auth/check-admin` | Check if your admin role permissions are working (requires admin token) |

#### Register
- **Endpoint**: `POST /api/auth/register`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string" // optional
  }
  ```
- **Response**: 
  ```json
  {
    "id": "string",
    "username": "string",
    "role": "COMMON",
    "createdAt": "timestamp"
  }
  ```

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "access_token": "JWT_TOKEN_STRING",
    "user": {
      "id": "string",
      "username": "string",
      "role": "ADMIN | HEAD_REFEREE | ALLIANCE_REFEREE | COMMON"
    }
  }
  ```

#### Check Authentication
- **Endpoint**: `GET /api/auth/check-auth`
- **Headers**:
  ``` 
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Response**: 
  ```json
  {
    "authenticated": true,
    "user": {
      "id": "string",
      "username": "string",
      "role": "string"
    },
    "message": "Your authentication is working correctly"
  }
  ```

#### Check Admin Access
- **Endpoint**: `GET /api/auth/check-admin`
- **Headers**:
  ``` 
  Authorization: Bearer YOUR_JWT_TOKEN
  ```
- **Response**: 
  ```json
  {
    "authenticated": true,
    "role": "ADMIN",
    "hasAdminAccess": true,
    "message": "Your ADMIN role is working correctly"
  }
  ```
- **Error Response** (if not admin):
  ```json
  {
    "statusCode": 401,
    "message": "User with role XXX does not have permission to access this resource",
    "error": "Unauthorized"
  }
  ```

### Using JWT Tokens

Include the JWT token in the Authorization header for protected API requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Important Notes on JWT Authentication

1. **Token Format**: Always include the "Bearer " prefix before your token
2. **Token Validity**: Tokens have a limited lifespan and will expire
3. **Authentication Headers**: Some API testing tools require you to set the token in a specific auth section rather than manually in headers

### Troubleshooting Authentication

If you encounter "Unauthorized" errors when attempting to access protected endpoints:

1. **Check your token** - Make sure it's valid and not expired
2. **Verify header format** - Ensure you're using `Authorization: Bearer YOUR_TOKEN`
3. **Verify role permissions** - Use `/api/auth/check-admin` to confirm your admin privileges
4. **Regenerate token** - Log in again to get a fresh token if needed

### Role-Based Permissions

The API implements role-based access control with the following roles:

| Role | Permissions |
|------|-------------|
| ADMIN | Full access to all resources (create, read, update, delete) |
| HEAD_REFEREE | Currently limited access (more permissions to be configured) |
| ALLIANCE_REFEREE | Currently limited access (more permissions to be configured) |
| COMMON | Read-only access to resources |

**Important**: Currently, only users with the **ADMIN** role can modify matches, stages, tournaments, teams, and users. Other role permissions will be configured in future updates.

## Common Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication token is missing or invalid
- `403 Forbidden`: User does not have permission to perform the action
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## API Endpoints

### Users

Base path: `/api/users`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/users` | List all users | Any role |
| GET | `/users/:id` | Get a specific user by ID | Any role |
| POST | `/users` | Create a new user | ADMIN |
| PATCH | `/users/:id` | Update a user | ADMIN |
| DELETE | `/users/:id` | Delete a user | ADMIN |

#### Create User
- **Endpoint**: `POST /api/users`
- **Body**: 
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```
- **Response**: Created user object

#### Get All Users
- **Endpoint**: `GET /api/users`
- **Response**: Array of user objects

#### Get User by ID
- **Endpoint**: `GET /api/users/:id`
- **Parameters**: `id` - User ID
- **Response**: User object

#### Update User
- **Endpoint**: `PATCH /api/users/:id`
- **Parameters**: `id` - User ID
- **Body**: 
  ```json
  {
    "username": "string", // optional
    "email": "string",    // optional
    "role": "string"      // optional
  }
  ```
- **Response**: Updated user object

#### Delete User
- **Endpoint**: `DELETE /api/users/:id`
- **Parameters**: `id` - User ID
- **Response**: Success message or deleted user object

### Teams

Base path: `/api/teams`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/teams` | List all teams (can filter by tournamentId) | Any role |
| GET | `/teams/:id` | Get a specific team by ID | Any role |
| POST | `/teams` | Create a new team | ADMIN |
| POST | `/teams/import` | Import multiple teams from CSV/text | ADMIN |
| PATCH | `/teams/:id` | Update a team | ADMIN |
| DELETE | `/teams/:id` | Delete a team | ADMIN |

#### Create Team
- **Endpoint**: `POST /api/teams`
- **Body**: 
  ```json
  {
    "name": "string",
    "teamNumber": "string",          // optional, will be auto-generated if not provided (format: 000001)
    "organization": "string",        // optional
    "avatar": "string (URL)",        // optional, URL to team avatar/logo
    "description": "string",         // optional
    "teamMembers": [                 // optional, array of team members
      {
        "name": "string",
        "role": "string",            // optional
        "email": "string",           // optional
        "phone": "string"            // optional
      }
    ],
    "tournamentId": "string (UUID)"  // optional, links team to a tournament
  }
  ```
- **Response**: Created team object with auto-generated teamNumber if not provided

#### Get All Teams
- **Endpoint**: `GET /api/teams`
- **Query Parameters**:
  - `tournamentId` - Optional UUID to filter teams by tournament
- **Response**: Array of team objects including tournament information

#### Get Team by ID
- **Endpoint**: `GET /api/teams/:id`
- **Parameters**: `id` - Team ID
- **Response**: Team object including tournament and match history

#### Update Team
- **Endpoint**: `PATCH /api/teams/:id`
- **Parameters**: `id` - Team ID
- **Body**: 
  ```json
  {
    "name": "string",                // optional
    "teamNumber": "string",          // optional
    "organization": "string",        // optional
    "avatar": "string (URL)",        // optional
    "description": "string",         // optional
    "teamMembers": [                 // optional
      {
        "name": "string",
        "role": "string",            // optional
        "email": "string",           // optional
        "phone": "string"            // optional
      }
    ],
    "tournamentId": "string (UUID)"  // optional
  }
  ```
- **Response**: Updated team object

#### Delete Team
- **Endpoint**: `DELETE /api/teams/:id`
- **Parameters**: `id` - Team ID
- **Response**: Deleted team object

#### Import Teams
- **Endpoint**: `POST /api/teams/import`
- **Body**: 
  ```json
  {
    "content": "Team Alpha\nTeam Beta,School XYZ\nTeam Gamma,School ABC,A great team",
    "format": "text",      // optional, "csv" or "text", default: "text"
    "hasHeader": false,    // optional, default: false
    "delimiter": ","       // optional, default: ","
  }
  ```
- **Notes**:
  - Each line format: `<name>,<organization>,<description>`
  - Team numbers are auto-generated in format 000001, 000002, etc.
  - At minimum, only team name is required
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Successfully imported 3 teams",
    "teams": [
      {
        "id": "uuid",
        "teamNumber": "000001",
        "name": "Team Alpha",
        "organization": null,
        "description": null,
        "avatar": null,
        "teamMembers": null,
        "tournamentId": null,
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      // ...more teams
    ]
  }
  ```

### Tournaments

Base path: `/api/tournaments`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/tournaments` | List all tournaments | Any role |
| GET | `/tournaments/:id` | Get a specific tournament by ID | Any role |
| POST | `/tournaments` | Create a new tournament | ADMIN |
| PATCH | `/tournaments/:id` | Update a tournament | ADMIN |
| DELETE | `/tournaments/:id` | Delete a tournament | ADMIN |

#### Create Tournament
- **Endpoint**: `POST /api/tournaments`
- **Body**: 
  ```json
  {
    "name": "string",
    "description": "string",
    "startDate": "string (ISO date)",
    "endDate": "string (ISO date)",
    "adminId": "string"
  }
  ```
- **Response**: Created tournament object

#### Get All Tournaments
- **Endpoint**: `GET /api/tournaments`
- **Response**: Array of tournament objects with admin information

#### Get Tournament by ID
- **Endpoint**: `GET /api/tournaments/:id`
- **Parameters**: `id` - Tournament ID
- **Response**: Tournament object

#### Update Tournament
- **Endpoint**: `PATCH /api/tournaments/:id`
- **Parameters**: `id` - Tournament ID
- **Body**: 
  ```json
  {
    "name": "string",                // optional
    "description": "string",         // optional
    "startDate": "string (ISO date)", // optional
    "endDate": "string (ISO date)"    // optional
  }
  ```
- **Response**: Updated tournament object

#### Delete Tournament
- **Endpoint**: `DELETE /api/tournaments/:id`
- **Parameters**: `id` - Tournament ID
- **Response**: Success message or deleted tournament object

### Stages

Base path: `/api/stages`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/stages` | List all stages | Any role |
| GET | `/stages/:id` | Get a specific stage by ID | Any role |
| POST | `/stages` | Create a new stage | ADMIN |
| PATCH | `/stages/:id` | Update a stage | ADMIN |
| DELETE | `/stages/:id` | Delete a stage | ADMIN |

#### Create Stage
- **Endpoint**: `POST /api/stages`
- **Body**: 
  ```json
  {
    "name": "string",
    "type": "SWISS | PLAYOFF | FINAL",
    "startDate": "string (ISO date with time)",
    "endDate": "string (ISO date with time)",
    "tournamentId": "string (UUID)"
  }
  ```
- **Important Notes**:
  - Stage dates (startDate and endDate) must be within the tournament's date range
  - Validation will fail if stage dates are outside tournament dates
- **Response**: Created stage object

#### Get All Stages
- **Endpoint**: `GET /api/stages`
- **Response**: Array of stage objects with their associated tournaments

#### Get Stage by ID
- **Endpoint**: `GET /api/stages/:id`
- **Parameters**: `id` - Stage ID
- **Response**: Stage object with tournament and matches data (including alliances and teams)

#### Update Stage
- **Endpoint**: `PATCH /api/stages/:id`
- **Parameters**: `id` - Stage ID
- **Body**: 
  ```json
  {
    "name": "string",                // optional
    "type": "SWISS | PLAYOFF | FINAL", // optional
    "startDate": "string (ISO date)", // optional
    "endDate": "string (ISO date)"    // optional
  }
  ```
- **Response**: Updated stage object

#### Delete Stage
- **Endpoint**: `DELETE /api/stages/:id`
- **Parameters**: `id` - Stage ID
- **Response**: Deleted stage object

### MatchScores

Base path: `/api/match-scores`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/match-scores` | List all match scores | Any role |
| GET | `/match-scores/:id` | Get a specific match score by ID | Any role |
| GET | `/match-scores/match/:matchId` | Get match scores by match ID | Any role |
| POST | `/match-scores` | Create match scores for a match | ADMIN, HEAD_REFEREE, ALLIANCE_REFEREE |
| PATCH | `/match-scores/:id` | Update match scores | ADMIN, HEAD_REFEREE, ALLIANCE_REFEREE |
| DELETE | `/match-scores/:id` | Delete match scores | ADMIN, HEAD_REFEREE |

#### Create Match Scores
- **Endpoint**: `POST /api/match-scores`
- **Body**: 
  ```json
  {
    "matchId": "string (UUID)",
    "redAutoScore": 0,             // optional, default: 0
    "redDriveScore": 0,            // optional, default: 0
    "redTotalScore": 0,            // optional, default: 0
    "blueAutoScore": 0,            // optional, default: 0
    "blueDriveScore": 0,           // optional, default: 0
    "blueTotalScore": 0,           // optional, default: 0
    "redGameElements": [           // optional
      {
        "element": "ball",
        "count": 3,
        "pointsEach": 20,
        "totalPoints": 60,
        "operation": "multiply"
      }
    ],
    "blueGameElements": [          // optional
      {
        "element": "ball",
        "count": 2,
        "pointsEach": 20,
        "totalPoints": 40,
        "operation": "multiply"
      }
    ],
    "redTeamCount": 2,             // optional, default: 0
    "redMultiplier": 1.5,          // optional, default: 1.0
    "blueTeamCount": 3,            // optional, default: 0
    "blueMultiplier": 1.75,        // optional, default: 1.0
    "scoreDetails": {}             // optional, additional score details as JSON
  }
  ```
- **Notes**:
  - Team count multipliers are automatically calculated if not provided:
    - 1 team: x1.25
    - 2 teams: x1.5
    - 3 teams: x1.75
    - 4 teams: x2.0
  - Game elements allow tracking individual scoring items with operations (add, subtract, multiply)
- **Response**: Created match scores object

#### Get All Match Scores
- **Endpoint**: `GET /api/match-scores`
- **Response**: Array of match scores objects with related match information

#### Get Match Scores by ID
- **Endpoint**: `GET /api/match-scores/:id`
- **Parameters**: `id` - Match scores ID
- **Response**: Match scores object with related match and alliance information

#### Get Match Scores by Match ID
- **Endpoint**: `GET /api/match-scores/match/:matchId`
- **Parameters**: `matchId` - Match ID
- **Response**: Match scores object with related match and alliance information

#### Update Match Scores
- **Endpoint**: `PATCH /api/match-scores/:id`
- **Parameters**: `id` - Match scores ID
- **Body**: 
  ```json
  {
    "redAutoScore": 10,            // optional
    "redDriveScore": 30,           // optional
    "redTotalScore": 40,           // optional
    "blueAutoScore": 15,           // optional
    "blueDriveScore": 25,          // optional
    "blueTotalScore": 40,          // optional
    "redGameElements": [...],      // optional
    "blueGameElements": [...],     // optional
    "redTeamCount": 2,             // optional
    "redMultiplier": 1.5,          // optional
    "blueTeamCount": 3,            // optional
    "blueMultiplier": 1.75,        // optional
    "scoreDetails": {}             // optional
  }
  ```
- **Notes**:
  - If you update `redTeamCount` without providing `redMultiplier`, the multiplier will be automatically calculated
  - Same for `blueTeamCount` and `blueMultiplier`
- **Response**: Updated match scores object

#### Delete Match Scores
- **Endpoint**: `DELETE /api/match-scores/:id`
- **Parameters**: `id` - Match scores ID
- **Response**: Success message or deleted match scores object

## Models

### User
```
{
  id: string
  username: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}
```

### Team
```
{
  id: string
  teamNumber: string       // Auto-generated format: 000001
  name: string
  organization: string?
  avatar: string?          // URL to team avatar image
  description: string?     // Team description
  teamMembers: {           // JSON array of team members
    name: string
    role?: string
    email?: string
    phone?: string
  }[]
  tournamentId: string?    // Optional link to tournament
  tournament: Tournament?
  createdAt: Date
  updatedAt: Date
}
```

### Tournament
```
{
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  adminId: string
  createdAt: Date
  updatedAt: Date
  admin: User
}
```

### Stage
```
{
  id: string
  name: string
  description: string
  tournamentId: string
  order: number
  type: string
  createdAt: Date
  updatedAt: Date
}
```

### Match
```
{
  id: string
  matchNumber: number
  stageId: string
  startTime: Date          // Full timestamp with hour-minute precision
  scheduledTime: Date      // Planned start time with hour-minute precision
  endTime: Date            // Full timestamp with hour-minute precision
  duration: number         // Duration in minutes
  status: string
  createdAt: Date
  updatedAt: Date
  alliances: Alliance[]
  referees: MatchReferee[] // Referees assigned to this match
}
```

### Alliance
```
{
  id: string
  matchId: string
  color: string
  teams: Team[]
  scoring: AllianceScoring
}
```

### AllianceScoring
```
{
  id: string
  allianceId: string
  score: number
  details: object
  refereeId: string
}
```

### MatchReferee
```
{
  id: string
  matchId: string
  userId: string
  user: User
  role: "HEAD_REFEREE" | "ALLIANCE_REFEREE"
  position: string       // Optional position identifier (e.g. "RED1", "BLUE2")
  createdAt: Date
  updatedAt: Date
}
```

### MatchScores
```
{
  id: string
  matchId: string
  match: Match
  
  // Red Alliance Scores
  redAutoScore: number
  redDriveScore: number
  redTotalScore: number
  
  // Blue Alliance Scores
  blueAutoScore: number
  blueDriveScore: number
  blueTotalScore: number
  
  // Game Elements Scoring
  redGameElements: [     // JSON array of game elements for red alliance
    {
      element: string    // Element name, e.g. "ball"
      count: number      // Number of elements collected
      pointsEach: number // Points per element
      totalPoints: number // Total points (count * pointsEach)
      operation: string  // Scoring operation ("add", "subtract", "multiply")
    }
  ]
  
  blueGameElements: [    // JSON array of game elements for blue alliance
    {
      element: string
      count: number
      pointsEach: number
      totalPoints: number
      operation: string
    }
  ]
  
  // Team counts and score multipliers
  redTeamCount: number   // Number of teams in red alliance (1-4)
  redMultiplier: number  // Score multiplier based on team count
  blueTeamCount: number  // Number of teams in blue alliance (1-4)
  blueMultiplier: number // Score multiplier based on team count
  
  scoreDetails: object   // Additional scoring details as JSON
  createdAt: Date
  updatedAt: Date
}
```