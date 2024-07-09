# FL-Koala


**Supervisor: Wei Wang**

**Client: Radiation oncology department within Austin Health**

| ID      | Name         | Role               |
| ------- | ------------ | ------------------ |
| 1367102 | Zhihao Liang | Quality Assurance  |
| 1351342 | Lin Duan     | Project Owner      |
| 1397061 | Lingyi Kong  | Scrum Master       |
| 1373110 | Yuncong Ji   | Archtecture Leader |
| 1133093 | Junhao Kong  | Deployment Leader  |
| 1132416 | Yijun Liu    | Development Leader |




## Description

A web interface developed using Flask and React that facilitates the execution of Python scripts for individuals lacking Python on their systems. This dashboard will be secure, intuitive, and integrated into the hospital's infrastructure, adhering to data protection regulations.

## Deployment Status

The primary reason the project has not been deployed publicly is due to the client's strategic decision to run the application on their own servers. The client has specific operational needs and security protocols that necessitate an internal deployment.

## Product Demo

Our final release product demo can be accessed via the following link:
[Final Release Product Demo](https://youtu.be/SKR6WB9w_GM)

## Previous Releases

Sprint 2 and 3 product release videos are retained for reference.

- [Sprint 2 Product Release](https://youtu.be/pmYtdWO1FxU)
- [Sprint 3 Product Release](https://youtu.be/gWFeZ6PK948)



## Repository Structure

- **`docs/`**: This folder contains all documentation related to the project. It includes project requirements, design documents, user stories, and other relevant materials that provide guidance and insight into the project's development and deployment processes.

- **`src/`**: The source code directory. It contains all the code developed for the project, organized into two main subdirectories:
  - **`backend/`**: Contains the Flask application setup, including Docker configurations (`Dockerfile`, `docker-compose.yml`), Python package dependencies (`requirements.txt`), and the Flask application structure (`app/`). The `app/` directory further includes:
    - **`controllers/`**: Modules for handling requests and responses for different parts of the application, such as authentication, script management, and user favorites.
    - **`models/`**: Definitions of data models, typically used with SQLAlchemy for database interactions.
    - **`services/`**: Business logic and interactions with the database, handling the core functionality for execution, scripts, and user management.
    - **`utils/`**: Utility functions and classes that provide support across the application, such as common functions and database utilities.
  - **`frontend/`**: Contains the Next.js application structure with configuration files, styles, and React components. Organized into:
    - **`public/`**: Static assets used by the frontend, such as images and icons.
    - **`src/`**: React component files, context definitions, hooks, and services that make up the application interface and logic. Key subdirectories include:
      - **`app/`**: High-level React components for different parts of the application such as authentication, dashboard, and error handling.
      - **`components/`**: Reusable UI components across the application, including authentication forms, dashboard widgets, and core layout components.
      - **`contexts/`**: React context files for managing global state.
      - **`hooks/`**: Custom React hooks for encapsulating functionality such as data fetching, state management, and interactions.
      - **`services/`**: Modules for handling external interactions like API requests.
      - **`stores/`**: State management stores, used for managing application state across sessions.
      - **`styles/`**: CSS and Emotion styled components for theming and global styles.

<br>

# FL-Koala Backend Setup Guide

This document provides instructions on how to set up the FL-Koala backend environment via
Docker Compose.

## Prerequisites

- Python 3.12
- Docker and Docker Compose (for Docker setup)


## Setup Using Docker Compose

### 1. Build and Run with Docker Compose

Ensure you have Docker and Docker Compose installed. Set the `DATABASE_URL` on your host machine:

#### On Linux/Mac:

```bash
export DATABASE_URL="youractualdatabaseurl"
```

#### On Windows (Command Prompt):

```cmd
set DATABASE_URL="youractualdatabaseurl"
```

Navigate to the project directory (`~/FL-Koala/src/backend`) and run:

```bash
docker-compose up --build
```

This command builds the Docker image and starts the service, exposing it on port 8080.

Rebuilding the image:

```bash
docker-compose up --build
```

# FL-Koala Frontend Setup Guide

## Prerequisites

Before starting, ensure your environment meets the following prerequisites:

   - Node.js version: `>= 20.x`
   - npm version: `>= 8.x`
   - Download and install from the [Node.js official website](https://nodejs.org/)
## Setup Frontend
### 1. **Package Managers**

   - It is recommended to use `yarn` or `pnpm` as the package manager
   - Install yarn:
     ```bash
     npm install --global yarn
     ```
   - Install pnpm:
     ```bash
     npm install --global pnpm
     ```

### 2. **Dependency Installation**

   Navigate to (`~/FL-Koala/src/frontend`) and run the commnad. Run the following command in the project root directory to install the required dependencies:

   - Using yarn:
     ```bash
     yarn install
     ```
   - Or using pnpm:
     ```bash
     pnpm install
     ```

### 3. **Run the Development Server**

   After the dependencies are installed, start the development server:
   - Using yarn:
     ```bash
     yarn run dev
     ```
   - Or using pnpm:
     ```bash
     pnpm run dev
     ```

### 4. **Open the Browser**

   Once the server is running and you see the "Ready" message, open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)



## Note

- Modify the `DATABASE_URL` environment variable according to your database configuration.
- Use the Docker setup for a more streamlined and consistent deployment environment.

<br>

## Workflow

Our development workflow is centered around three main types of branches: `main`, `dev`, and feature branches. Each branch serves a specific purpose in the lifecycle of our application development, ensuring a streamlined and organized process.

### Branches

- **Main Branch**: The `main` branch is our production branch. This branch contains the project's release history and is always in a deployable state.

- **Dev Branch**: The `dev` branch serves as the integration branch for features. It is the default branch where all feature branches are merged and tested together. Once the team is confident in the stability of `dev`, it is merged into `main` for release.

- **Feature Branches**: Feature branches are used for developing new features or bug fixes. They are created from the `dev` branch and should be named according to the conventions outlined below to reflect their purpose and the technology stack they impact.

### Naming Conventions

To maintain clarity and consistency, we follow specific naming conventions for our feature branches. These conventions help in identifying the purpose of the branch, the technology stack involved, and the feature or bug it addresses.

**General Format**: `<type>/<tech>-<description>`

- `<type>`: Indicates the purpose of the branch (e.g., `feat`, `fix`, `refactor`, `docs`, etc.).
- `<tech>`: Specifies the technology stack or component the branch focuses on (`react` for frontend changes, `py` for backend changes).
- `<description>`: A brief, hyphen-separated description of the feature or fix.

#### Examples

- **Feature Branch for React**: For a new feature in the React frontend that adds a login form, the branch could be named as follows:

  - `feat/frontend-login-form`

- **Bug Fix Branch for Python**: For a bug fix in the Python backend related to user authentication, the branch might be named:

  - `fix/backend-auth-bug`

- **Refactoring Branch for Both Stacks**: For a refactoring that affects both the React and Python codebases, you could use:
  - `refactor/cleanup-unused-imports`

## Useful link

[Confluence](https://comp90082-2024-fl-koala.atlassian.net/wiki/x/voE)

[Trello](https://trello.com/b/1G1lpSyz/trello-agile-sprint-board-template)

## Changelog

#### [COMP90082_2024_SM1_FL_Koala_BL_SPRINT2](https://github.com/COMP90082-2024-SM1/FL-Koala/releases/tag/COMP90082_2024_SM1_FL_Koala_BL_SPRINT2) - 2024-05-02

### Added

- **Script Execution from Web Interface**: Implemented the ability for medical physicists to run specific scripts via a web interface, eliminating the need for Python or command-line expertise.
- **Dashboard for Script Status**: Added a dashboard for users to monitor the usage and functionality of scripts.
- **Upload New Scripts**: Enabled users to upload new scripts that meet operational standards for security and functionality.
- **Save Script Output**: Provided the functionality for medical physicists to save script outputs for repeated viewing.
- **Adaptation to Various Script Outputs**: Enhanced the interface to adapt to various script outputs, allowing clinical researchers to view and analyze results directly.
- **Script Output Visibility**: Ensured that medical physicists can see the output of scripts to verify their successful execution.
- **Script Modification Security**: Established security measures to ensure that only authorized personnel can modify scripts.
- **User Login and Management**: Developed a login system for managing user information and system access.
- **Save Frequently Used Scripts**: Created a feature that allows users to save frequently used scripts for quick and easy execution.

### Changed

- Update Readme file and doc folder

#### [COMP90082_2024_SM1_FL_Koala_BL_SPRINT1](https://github.com/COMP90082-2024-SM1/FL-Koala/releases/tag/COMP90082_2024_SM1_FL_Koala_BL_SPRINT1) - 2024-03-25

### Added

- Initial project setup and documentation.





