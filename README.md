# react-django-auth-system

[![License](https://img.shields.io/github/license/Bitxo92/react-django-auth-system)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-available-brightgreen)](#)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
[![Stars](https://img.shields.io/github/stars/Bitxo92/react-django-auth-system?style=social)](https://github.com/Bitxo92/react-django-auth-system/stargazers)
[![Forks](https://img.shields.io/github/forks/Bitxo92/react-django-auth-system?style=social)](https://github.com/Bitxo92/react-django-auth-system/network/members)

<img width="1915" height="909" alt="image" src="https://github.com/user-attachments/assets/f960d6a2-9eff-4adf-9099-bc559094a542" />


<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/2d7828f3-06ba-475e-97ce-34252e3f1c9e" />



## About
An open-source project template designed to help developers quickly build full-stack applications with a modern React frontend and a Django REST Framework backend. It provides a ready-to-use authentication system with login and registration functionality, token-based authentication using SimpleJWT, responsive design styled with Tailwind CSS v4, and seamless API integration between frontend and backend. 
This project serves as a starting point for developers looking to bootstrap Django-React applications efficiently, offering a clean, maintainable structure that can be easily extended or customized.

## Features

- User authentication with JWT tokens
- Secure password management
- Responsive design with Tailwind CSS
- Real-time form validation
- Interactive UI with animations
- Protected routes and API endpoints

## Tech Stack

### Frontend
- ![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white) 
- ![Vite](https://img.shields.io/badge/Vite-3C8772?logo=vite&logoColor=white) 
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwind-css&logoColor=white) 
- ![Lucide React](https://img.shields.io/badge/Lucide-000000?logo=lucide&logoColor=white) 
- ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white) 
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=react-router&logoColor=white) 
- ![LottieFiles](https://img.shields.io/badge/LottieFiles-FF4081?logo=lottiefiles&logoColor=white) 
- ![Vitest](https://img.shields.io/badge/Vitest-222222?logo=vitest&logoColor=white) 

### Backend
- ![Django](https://img.shields.io/badge/Django-092E20?logo=django&logoColor=white) 
- ![DRF](https://img.shields.io/badge/Django_REST_Framework-092E20?logo=django&logoColor=white) 
- ![SimpleJWT](https://img.shields.io/badge/SimpleJWT-000000?logo=jsonwebtokens&logoColor=white) 
- ![SQLite](https://img.shields.io/badge/SQLite-07405E?logo=sqlite&logoColor=white) 
- ![CORS](https://img.shields.io/badge/CORS-000000?logo=cors&logoColor=white) 


## Getting Started

### Prerequisites
- Node.js (latest version)
- Python 3.12+
- npm or yarn

### Installation

1. Clone the repository
```sh
git clone https://github.com/Bitxo92/react-django-auth-system.git

```

2. Setup Backend
```sh
cd Backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. Setup Frontend
```sh
cd Frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Development

### Running Tests

Frontend tests:
```sh
cd Frontend
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage
```

Backend tests:
```sh
cd Backend
python manage.py test
```

### Available Scripts

Frontend:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm test` - Run tests
- `npm run test -- -t"<test-name>"` - Run specific test
- `npm run test:coverage` - Run tests with coverage

Backend:
- `python manage.py runserver` - Start development server
- `python manage.py migrate` - Run migrations
- `python manage.py createsuperuser` - Create admin user

## Project Structure

```
Project/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── test/
│   │   └── main.jsx
│   ├── public/
│   └── package.json
└── Backend/
    ├── api/
    │   ├── migrations/
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    └── Backend/
        └── settings.py
```

## API Endpoints

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/verify/` - Verify JWT token
- `GET /api/auth/health/` - Health check endpoint
- `POST /api/token/refresh/` - Refresh JWT token

# License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.  
See the [LICENSE](LICENSE) file for the full details.  



## Contributing

We welcome contributions from the community! Your help improves this template and benefits developers building React-Django applications.  

### Ways to Contribute
- **Bug reports** – If you find a bug, please open an issue with a clear description and steps to reproduce.  
- **Feature requests** – Suggest new features or improvements that enhance the template.  
- **Code contributions** – Submit code improvements, fixes, or new features.  
- **Documentation updates** – Improve clarity, add examples, or update guides.  
- **Tests** – Add or enhance tests for backend and frontend functionality.

### Guidelines for Code Contributions
1. **Fork the repository** and create a descriptive branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement your changes** following the existing code style.
3. **Include/run tests** for new features or bug fixes:
   ```bash
    # Backend Django tests
    python manage.py test

    # Frontend Vitest
    npm run test
   ```
4. Commit your changes with a clear and concise message following conventional commit guidelines:

| Type        | Description                                                                 | Example                                   |
|------------|-----------------------------------------------------------------------------|-------------------------------------------|
| **feat**    | A new feature                                                               | `feat(auth): add social login`            |
| **fix**     | A bug fix                                                                   | `fix(api): correct login endpoint`        |
| **docs**    | Documentation only                                                          | `docs(readme): update installation steps` |
| **style**   | Code style changes (formatting, missing semi-colons, etc.)                  | `style(css): fix button padding`          |
| **refactor**| Code change that neither fixes a bug nor adds a feature                     | `refactor(auth): simplify login logic`    |
| **perf**    | Performance improvements                                                    | `perf(api): optimize query`               |
| **test**    | Adding or updating tests                                                    | `test(auth): add tests for login`        |
| **chore**   | Other changes that do not modify src or test files (e.g., build scripts)   | `chore(deps): update npm packages`       |
| **ci**      | Changes to CI configuration or scripts                       

5. Push your branch and open a Pull Request.

### Code Quality & Style

- Follow the existing **Python/Django** and **JavaScript/React** code conventions.  
- Ensure code is **readable, maintainable, and well-documented**.  
- Keep commits **small, focused, and atomic**.  

### Pull Requests

- PRs should clearly describe the **changes and motivation**.  
- Include **screenshots** for UI changes when possible.  
- Link any **related issues**.
> [!Important]
> By contributing, you agree that your contributions will be licensed under **GPL-3.0**, ensuring this project remains free and open source.


<h2 align="center">⭐ Please Support this project by giving it a star ⭐</h2>
